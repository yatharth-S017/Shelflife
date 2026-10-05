import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/member.model';
import { BorrowRecord } from '../models/borrowRecord.model';
import { AppError } from '../middleware/error.middleware';

// POST /api/members
export const registerMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, membershipId } = req.body;

    const existingEmail = await Member.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new AppError(`Member with email ${email} already exists`, 409);
    }

    const existingId = await Member.findOne({ membershipId: membershipId.toUpperCase() });
    if (existingId) {
      throw new AppError(`Member with membership ID ${membershipId} already exists`, 409);
    }

    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      membershipId: membershipId.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/members (list all members for dropdowns/management)
export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/members/:id/history
export const getMemberHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const history = await BorrowRecord.find({ member: id })
      .populate('book', 'title author ISBN genre')
      .populate('member', 'name email membershipId')
      .sort({ issueDate: -1 });

    // Dynamically mark overdue items if dueDate < today and status === 'issued'
    const now = new Date();
    const processedHistory = history.map((record) => {
      const doc = record.toObject();
      if (doc.status === 'issued' && new Date(doc.dueDate) < now) {
        doc.status = 'overdue';
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      data: {
        member,
        borrowHistory: processedHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
