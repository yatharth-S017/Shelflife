"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnBook = exports.issueBook = void 0;
const book_model_1 = require("../models/book.model");
const member_model_1 = require("../models/member.model");
const borrowRecord_model_1 = require("../models/borrowRecord.model");
const error_middleware_1 = require("../middleware/error.middleware");
// POST /api/borrow - Issue a book to a member
const issueBook = async (req, res, next) => {
    try {
        const { bookId, memberId, dueDate } = req.body;
        // Verify member exists
        const member = await member_model_1.Member.findById(memberId);
        if (!member) {
            throw new error_middleware_1.AppError('Member not found', 404);
        }
        /*
         * ATOMIC RACE CONDITION PROTECTION:
         * We use findOneAndUpdate with condition availableCopies > 0 and $inc: { availableCopies: -1 }.
         * This guarantees that even if multiple concurrent requests hit this endpoint,
         * MongoDB's atomic document locking ensures availableCopies never drops below 0.
         */
        const updatedBook = await book_model_1.Book.findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }, { new: true });
        if (!updatedBook) {
            const bookExists = await book_model_1.Book.findById(bookId);
            if (!bookExists) {
                throw new error_middleware_1.AppError('Book not found', 404);
            }
            throw new error_middleware_1.AppError('No available copies left for this book', 400);
        }
        // Default due date to 14 days from now if not specified
        const calculatedDueDate = dueDate
            ? new Date(dueDate)
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const borrowRecord = await borrowRecord_model_1.BorrowRecord.create({
            book: bookId,
            member: memberId,
            issueDate: new Date(),
            dueDate: calculatedDueDate,
            status: 'issued',
        });
        const populatedRecord = await borrowRecord_model_1.BorrowRecord.findById(borrowRecord._id)
            .populate('book', 'title author ISBN genre availableCopies')
            .populate('member', 'name email membershipId');
        res.status(201).json({
            success: true,
            message: 'Book issued successfully',
            data: populatedRecord,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.issueBook = issueBook;
// POST /api/return/:borrowId - Return an issued book
const returnBook = async (req, res, next) => {
    try {
        const { borrowId } = req.params;
        const borrowRecord = await borrowRecord_model_1.BorrowRecord.findById(borrowId);
        if (!borrowRecord) {
            throw new error_middleware_1.AppError('Borrow record not found', 404);
        }
        if (borrowRecord.status === 'returned') {
            throw new error_middleware_1.AppError('This book has already been returned', 400);
        }
        // Update return record
        borrowRecord.returnDate = new Date();
        borrowRecord.status = 'returned';
        await borrowRecord.save();
        // Increment available copies atomically
        await book_model_1.Book.findByIdAndUpdate(borrowRecord.book, {
            $inc: { availableCopies: 1 },
        });
        const updatedRecord = await borrowRecord_model_1.BorrowRecord.findById(borrowId)
            .populate('book', 'title author ISBN genre availableCopies')
            .populate('member', 'name email membershipId');
        res.status(200).json({
            success: true,
            message: 'Book returned successfully',
            data: updatedRecord,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.returnBook = returnBook;
