import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/book.model';
import { Member } from '../models/member.model';
import { BorrowRecord } from '../models/borrowRecord.model';
import { AppError } from '../middleware/error.middleware';

// POST /api/borrow - Issue a book to a member
export const issueBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId, memberId, dueDate } = req.body;

    // Verify member exists
    const member = await Member.findById(memberId);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    /*
     * ATOMIC RACE CONDITION PROTECTION:
     * We use findOneAndUpdate with condition availableCopies > 0 and $inc: { availableCopies: -1 }.
     * This guarantees that even if multiple concurrent requests hit this endpoint,
     * MongoDB's atomic document locking ensures availableCopies never drops below 0.
     */
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      const bookExists = await Book.findById(bookId);
      if (!bookExists) {
        throw new AppError('Book not found', 404);
      }
      throw new AppError('No available copies left for this book', 400);
    }

    // Default due date to 14 days from now if not specified
    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const borrowRecord = await BorrowRecord.create({
      book: bookId,
      member: memberId,
      issueDate: new Date(),
      dueDate: calculatedDueDate,
      status: 'issued',
    });

    const populatedRecord = await BorrowRecord.findById(borrowRecord._id)
      .populate('book', 'title author ISBN genre availableCopies')
      .populate('member', 'name email membershipId');

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: populatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/return/:borrowId - Return an issued book
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { borrowId } = req.params;

    const borrowRecord = await BorrowRecord.findById(borrowId);
    if (!borrowRecord) {
      throw new AppError('Borrow record not found', 404);
    }

    if (borrowRecord.status === 'returned') {
      throw new AppError('This book has already been returned', 400);
    }

    // Update return record
    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';
    await borrowRecord.save();

    // Increment available copies atomically
    await Book.findByIdAndUpdate(borrowRecord.book, {
      $inc: { availableCopies: 1 },
    });

    const updatedRecord = await BorrowRecord.findById(borrowId)
      .populate('book', 'title author ISBN genre availableCopies')
      .populate('member', 'name email membershipId');

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};
