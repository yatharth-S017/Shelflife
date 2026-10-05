"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrow_controller_1 = require("../controllers/borrow.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// Route: POST /api/borrow (Issue book) - Protected
router.post('/', auth_middleware_1.authenticateLibrarian, (0, validate_middleware_1.validateRequest)(validators_1.issueBookSchema), borrow_controller_1.issueBook);
// Route: POST /api/return/:borrowId (Return book) - Protected
router.post('/return/:borrowId', auth_middleware_1.authenticateLibrarian, borrow_controller_1.returnBook);
exports.default = router;
