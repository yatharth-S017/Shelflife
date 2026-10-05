"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemberHistory = exports.getMembers = exports.registerMember = void 0;
const member_model_1 = require("../models/member.model");
const borrowRecord_model_1 = require("../models/borrowRecord.model");
const error_middleware_1 = require("../middleware/error.middleware");
// POST /api/members
const registerMember = async (req, res, next) => {
    try {
        const { name, email, membershipId } = req.body;
        const existingEmail = await member_model_1.Member.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            throw new error_middleware_1.AppError(`Member with email ${email} already exists`, 409);
        }
        const existingId = await member_model_1.Member.findOne({ membershipId: membershipId.toUpperCase() });
        if (existingId) {
            throw new error_middleware_1.AppError(`Member with membership ID ${membershipId} already exists`, 409);
        }
        const member = await member_model_1.Member.create({
            name,
            email: email.toLowerCase(),
            membershipId: membershipId.toUpperCase(),
        });
        res.status(201).json({
            success: true,
            message: 'Member registered successfully',
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registerMember = registerMember;
// GET /api/members (list all members for dropdowns/management)
const getMembers = async (req, res, next) => {
    try {
        const members = await member_model_1.Member.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMembers = getMembers;
// GET /api/members/:id/history
const getMemberHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const member = await member_model_1.Member.findById(id);
        if (!member) {
            throw new error_middleware_1.AppError('Member not found', 404);
        }
        const history = await borrowRecord_model_1.BorrowRecord.find({ member: id })
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
    }
    catch (error) {
        next(error);
    }
};
exports.getMemberHistory = getMemberHistory;
