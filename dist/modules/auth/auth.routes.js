"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("../users/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validate_1 = require("../users/user.validate");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.authController.credentialsLogin);
router.post('/refresh', auth_controller_1.authController.getNeAccessToken);
router.post('/change-password', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), auth_controller_1.authController.changePassword);
router.get('/forget-password/:email', auth_controller_1.authController.forgetPassword);
router.get('/verify_reset_password_otp/:email/:otp', auth_controller_1.authController.verifyOTP);
router.post('/reset-password', (0, validateRequest_1.validateRequest)(user_validate_1.passwordZodSchema), auth_controller_1.authController.resetPassword);
// GOOGLE LOGIN HANDLE
router.get('/google', auth_controller_1.authController.googleLogin);
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), auth_controller_1.authController.googleCallback);
// APPLE LOGIN HANDLE
router.get('/apple', auth_controller_1.authController.appleLogin);
router.get('/apple/callback', passport_1.default.authenticate('apple', { failureRedirect: '/login' }), auth_controller_1.authController.appleCallback);
router.post('/google/login', auth_controller_1.authController.googleTokenLogin);
exports.authRouter = router;
