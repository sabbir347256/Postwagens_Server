"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_interface_1 = require("./user.interface");
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("../../config/env"));
// USER DAILY ACTIVITY SCHEMA
// const dailyActivitySchema = new Schema<IUserActivity>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: 'user' },
//     date: { type: Date, required: true },
//   },
//   {
//     versionKey: false,
//     timestamps: true,
//   }
// );
// dailyActivitySchema.index({ user: 1, date: 1 }, { unique: true });
// export const UserActivity = model<IUserActivity>(
//   'user_activity',
//   dailyActivitySchema
// );
// ============USER MAIN SCHEMA=============
const authProviderSchema = new mongoose_1.default.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
}, {
    _id: false,
    versionKey: false,
});
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String },
    bio: { type: String, default: null },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String, default: null },
    password: { type: String, select: false },
    fcmToken: { type: String },
    verifiedBadge: { type: Boolean, default: false },
    verifiedBadgeExpiration: { type: Date },
    isVerified: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: [...Object.values(user_interface_1.IsActive)],
        default: user_interface_1.IsActive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, enum: [...Object.values(user_interface_1.Role)], default: user_interface_1.Role.USER },
    auths: [authProviderSchema],
    location: { type: String },
}, {
    versionKey: false,
    timestamps: true,
});
// Hashed password
userSchema.pre('save', async function () {
    if (!this.password)
        return;
    const hashedPassword = await bcrypt_1.default.hash(this.password, parseInt(env_1.default.BCRYPT_SALT_ROUND));
    this.password = hashedPassword;
});
// Indexing through search field
userSchema.index({
    fullName: 'text',
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
