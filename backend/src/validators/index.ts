import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  ISBN: z.string().min(5, 'Valid ISBN required (min 5 chars)'),
  genre: z.string().min(1, 'Genre is required'),
  totalCopies: z.number().int().min(1, 'Total copies must be at least 1'),
  availableCopies: z.number().int().min(0, 'Available copies cannot be negative').optional(),
});

export const createMemberSchema = z.object({
  name: z.string().min(1, 'Member name is required'),
  email: z.string().email('Invalid email address format'),
  membershipId: z.string().min(2, 'Membership ID must be at least 2 characters'),
});

export const issueBookSchema = z.object({
  bookId: z.string().min(24, 'Invalid book ObjectId'),
  memberId: z.string().min(24, 'Invalid member ObjectId'),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
