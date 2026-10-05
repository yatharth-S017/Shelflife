"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateLibrarian = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const authenticateLibrarian = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new error_middleware_1.AppError('Access denied. No token provided.', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'shelflife_secret_key_jwt_2026_super_secure';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.role !== 'librarian') {
            return next(new error_middleware_1.AppError('Forbidden. Only librarians can perform this action.', 403));
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new error_middleware_1.AppError('Invalid or expired token.', 401));
    }
};
exports.authenticateLibrarian = authenticateLibrarian;
