"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_1.validateRequest)(validators_1.loginSchema), auth_controller_1.login);
exports.default = router;
