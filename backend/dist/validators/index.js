"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.issueBookSchema = exports.createMemberSchema = exports.createBookSchema = void 0;
const zod_1 = require("zod");
exports.createBookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    author: zod_1.z.string().min(1, 'Author is required'),
    ISBN: zod_1.z.string().min(5, 'Valid ISBN required (min 5 chars)'),
    genre: zod_1.z.string().min(1, 'Genre is required'),
    totalCopies: zod_1.z.number().int().min(1, 'Total copies must be at least 1'),
    availableCopies: zod_1.z.number().int().min(0, 'Available copies cannot be negative').optional(),
});
exports.createMemberSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Member name is required'),
    email: zod_1.z.string().email('Invalid email address format'),
    membershipId: zod_1.z.string().min(2, 'Membership ID must be at least 2 characters'),
});
exports.issueBookSchema = zod_1.z.object({
    bookId: zod_1.z.string().min(24, 'Invalid book ObjectId'),
    memberId: zod_1.z.string().min(24, 'Invalid member ObjectId'),
    dueDate: zod_1.z.string().datetime().optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
