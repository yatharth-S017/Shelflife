"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const book_routes_1 = __importDefault(require("./book.routes"));
const member_routes_1 = __importDefault(require("./member.routes"));
const borrow_routes_1 = __importDefault(require("./borrow.routes"));
const borrow_controller_1 = require("../controllers/borrow.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/books', book_routes_1.default);
router.use('/members', member_routes_1.default);
router.use('/borrow', borrow_routes_1.default);
// Explicit alias for POST /api/return/:borrowId as specified in Q1 b)
router.post('/return/:borrowId', auth_middleware_1.authenticateLibrarian, borrow_controller_1.returnBook);
exports.default = router;
