"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_validate_1 = require("./user.validate");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("./user.interface");
const multer_config_1 = require("../../config/multer.config");
const follow_controller_1 = require("../follow/follow.controller");
const router = express_1.default.Router();
// USER REGISTRATION
router.post('/registration', (0, validateRequest_1.validateRequest)(user_validate_1.userZodSchema), user_controller_1.userControllers.registerUser);
// GET ME
router.get('/get_me', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.getMe);
// Purchase Badge
router.post('/purchase-badge', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.userControllers.purchaseBadge);
// GET USER PROFILE
router.get('/profile/:userId', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.getProfile);
// GET ALL USER LIST
router.get('/', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.userControllers.getAllUser);
// Follow routes
router.post('/:userId/toggle-follow', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), follow_controller_1.FollowController.toggleFollow);
router.get('/:userId/followers', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), follow_controller_1.FollowController.getFollowers);
router.get('/:userId/following', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), follow_controller_1.FollowController.getFollowing);
// UPDATE USER
router.patch('/update', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), multer_config_1.multerUpload.single('file'), (0, validateRequest_1.validateRequest)(user_validate_1.userUpdateZodSchema), user_controller_1.userControllers.userUpdate);
// DELETE USER
router.delete('/:userId', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.userDelete);
// USER PHONE NUMBER VERIFICATION
router.get('/phone_number_verification', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.userVefification);
router.post('/verify_otp', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.verifyOTP);
router.put('/suspend/:userId', (0, auth_middleware_1.checkAuth)(...Object.keys(user_interface_1.Role)), user_controller_1.userControllers.updateSuspendStatus);
exports.userRoutes = router;
