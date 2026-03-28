"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentValidation = void 0;
const zod_1 = require("zod");
const createCommentSchema = zod_1.z.object({
    text: zod_1.z.string(),
    parentId: zod_1.z.string().optional(),
});
const updateCommentSchema = zod_1.z.object({
    text: zod_1.z.string().optional(),
});
exports.CommentValidation = {
    createCommentSchema,
    updateCommentSchema,
};
