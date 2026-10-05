"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const mongoose_1 = require("mongoose");
const memberSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    membershipId: {
        type: String,
        required: [true, 'Membership ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    joinedDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
exports.Member = (0, mongoose_1.model)('Member', memberSchema);
