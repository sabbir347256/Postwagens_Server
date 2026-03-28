"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordZodSchema = exports.userUpdateZodSchema = exports.userZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
// Create Schema
exports.userZodSchema = zod_1.default.object({
    fullName: zod_1.default
        .string({ error: 'Name must be string type!' })
        .min(3, 'Name must be at least 3 characters!')
        .max(100, 'Name must be maximum 100 characters!')
        .optional(),
    organizationName: zod_1.default
        .string({ error: 'Organization name must be string type!' })
        .min(3, 'Organization name must be at least 3 characters!')
        .max(100, 'Organization name must be maximum 100 characters!')
        .optional(),
    email: zod_1.default.string().email(),
    phone: zod_1.default
        .string({ message: 'Phone number must be string type!' })
        .regex(/^\+[1-9]\d{7,14}$/, { error: 'Invalid phone number format!' })
        .optional(),
    password: zod_1.default
        .string({ error: 'Password shuld be string type!' })
        .min(6, 'Password length shuld be at least 6!')
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, {
        message: 'Password must be at least 1 uppercase character, 1 special charater, 1 number!',
    })
        .optional(),
    avatar: zod_1.default.string({ error: 'Image should be string' }).optional(),
    gender: zod_1.default.enum(['male', 'female', 'other']).optional(),
});
// Update Schema
exports.userUpdateZodSchema = zod_1.default.object({
    fullName: zod_1.default
        .string({ error: 'Full name must be string type!' })
        .min(3, 'Full name must be at least 3 characters!')
        .max(100, 'Full name must be maximum 100 characters!')
        .optional(),
    bio: zod_1.default
        .string({ error: 'Bio must be string type!' })
        .min(3, 'Bio must be at least 3 characters!')
        .max(150, 'Bio must be maximum 150 characters!')
        .optional(),
    phone: zod_1.default.string({ message: 'Phone number must be string type!' }).optional(),
    avatar: zod_1.default.string({ error: 'Image should be string' }).optional(),
    gender: zod_1.default.enum(['male', 'female', 'other']).optional(),
    fcmToken: zod_1.default.string('FCM token must be in string type!').optional(),
    role: zod_1.default.enum([user_interface_1.Role.USER, user_interface_1.Role.ADMIN, user_interface_1.Role.ORGANIZER]).optional(),
    interests: zod_1.default.array(zod_1.default.string()).optional(),
    isActive: zod_1.default
        .enum([user_interface_1.IsActive.ACTIVE, user_interface_1.IsActive.INACTIVE, user_interface_1.IsActive.BLOCKED])
        .optional(),
    isDeleted: zod_1.default.boolean().optional(),
    isVerified: zod_1.default.boolean().optional(),
    location: zod_1.default.string().optional(),
});
exports.passwordZodSchema = zod_1.default.object({
    newPassword: zod_1.default
        .string({ error: 'Password shuld be string type!' })
        .min(6, 'Password length shuld be at least 6!')
        .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/, {
        message: 'Password must be at least 1 uppercase character, 1 special charater, 1 number!',
    }),
});
