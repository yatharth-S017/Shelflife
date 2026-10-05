import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateLibrarian = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'shelflife_secret_key_jwt_2026_super_secure';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };

    if (decoded.role !== 'librarian') {
      return next(new AppError('Forbidden. Only librarians can perform this action.', 403));
    }

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};
