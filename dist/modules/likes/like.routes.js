"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeRoutes = void 0;
const express_1 = __importDefault(require("express"));
const like_controller_1 = require("./like.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router({ mergeParams: true });
router.post('/like', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), like_controller_1.LikeController.likePost);
router.delete('/like', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), like_controller_1.LikeController.unlikePost);
router.get('/likes', like_controller_1.LikeController.getLikesForPost);
exports.LikeRoutes = router;
