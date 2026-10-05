import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/book.model';
import { AppError } from '../middleware/error.middleware';

// POST /api/books
export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;

    const existingBook = await Book.findOne({ ISBN: ISBN.toUpperCase() });
    if (existingBook) {
      throw new AppError(`Book with ISBN ${ISBN} already exists`, 409);
    }

    const initialAvailable = availableCopies !== undefined ? availableCopies : totalCopies;

    const book = await Book.create({
      title,
      author,
      ISBN: ISBN.toUpperCase(),
      genre,
      totalCopies,
      availableCopies: initialAvailable,
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books (Support pagination, genre filter, search query)
export const getBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const genre = req.query.genre as string;
    const search = req.query.search as string;

    const filter: any = {};

    if (genre && genre !== 'All') {
      filter.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { ISBN: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
