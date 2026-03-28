"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostMediaZodSchema = exports.updatePostZodSchema = exports.createPostZodSchema = void 0;
const zod_1 = require("zod");
exports.createPostZodSchema = zod_1.z.object({
    text: zod_1.z.string(),
});
exports.updatePostZodSchema = zod_1.z.object({
    text: zod_1.z.string().optional(),
});
exports.deletePostMediaZodSchema = zod_1.z.object({
    postId: zod_1.z.string(),
    mediaUrl: zod_1.z.string(),
});
