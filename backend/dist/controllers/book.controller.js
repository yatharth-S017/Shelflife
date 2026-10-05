"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooks = exports.addBook = void 0;
const book_model_1 = require("../models/book.model");
const error_middleware_1 = require("../middleware/error.middleware");
// POST /api/books
const addBook = async (req, res, next) => {
    try {
        const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;
        const existingBook = await book_model_1.Book.findOne({ ISBN: ISBN.toUpperCase() });
        if (existingBook) {
            throw new error_middleware_1.AppError(`Book with ISBN ${ISBN} already exists`, 409);
        }
        const initialAvailable = availableCopies !== undefined ? availableCopies : totalCopies;
        const book = await book_model_1.Book.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.addBook = addBook;
// GET /api/books (Support pagination, genre filter, search query)
const getBooks = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const genre = req.query.genre;
        const search = req.query.search;
        const filter = {};
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
            book_model_1.Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            book_model_1.Book.countDocuments(filter),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getBooks = getBooks;
