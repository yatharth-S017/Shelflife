import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware';

// Default librarian credentials for demonstration/testing
const LIBRARIAN_CREDENTIALS = {
  id: 'lib_001',
  email: 'librarian@shelflife.com',
  password: 'password123',
  name: 'Head Librarian',
  role: 'librarian',
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (email !== LIBRARIAN_CREDENTIALS.email || password !== LIBRARIAN_CREDENTIALS.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const secret = process.env.JWT_SECRET || 'shelflife_secret_key_jwt_2026_super_secure';
    const token = jwt.sign(
      {
        id: LIBRARIAN_CREDENTIALS.id,
        email: LIBRARIAN_CREDENTIALS.email,
        role: LIBRARIAN_CREDENTIALS.role,
      },
      secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: LIBRARIAN_CREDENTIALS.id,
          name: LIBRARIAN_CREDENTIALS.name,
          email: LIBRARIAN_CREDENTIALS.email,
          role: LIBRARIAN_CREDENTIALS.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
