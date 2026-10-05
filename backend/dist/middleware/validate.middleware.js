"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issueMessages = error.issues
                    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                    .join(', ');
                return res.status(400).json({
                    success: false,
                    error: {
                        message: `Validation Error: ${issueMessages}`,
                        statusCode: 400,
                    },
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
