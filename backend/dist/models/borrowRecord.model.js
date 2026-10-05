"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowRecord = void 0;
const mongoose_1 = require("mongoose");
const borrowRecordSchema = new mongoose_1.Schema({
    book: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book reference is required'],
    },
    member: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Member reference is required'],
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    returnDate: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue'],
        default: 'issued',
    },
}, {
    timestamps: true,
});
borrowRecordSchema.index({ member: 1 });
borrowRecordSchema.index({ book: 1 });
borrowRecordSchema.index({ status: 1 });
exports.BorrowRecord = (0, mongoose_1.model)('BorrowRecord', borrowRecordSchema);
