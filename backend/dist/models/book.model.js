"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const mongoose_1 = require("mongoose");
const bookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
    },
    ISBN: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        trim: true,
    },
    totalCopies: {
        type: Number,
        required: [true, 'Total copies count is required'],
        min: [0, 'Total copies cannot be negative'],
    },
    availableCopies: {
        type: Number,
        required: [true, 'Available copies count is required'],
        min: [0, 'Available copies cannot be negative'],
        validate: {
            validator: function (val) {
                if (this.totalCopies !== undefined) {
                    return val <= this.totalCopies;
                }
                return true;
            },
            message: 'Available copies cannot exceed total copies',
        },
    },
}, {
    timestamps: true,
});
// Indexes for fast lookup & filtering
bookSchema.index({ genre: 1 });
bookSchema.index({ title: 'text', author: 'text' });
exports.Book = (0, mongoose_1.model)('Book', bookSchema);
