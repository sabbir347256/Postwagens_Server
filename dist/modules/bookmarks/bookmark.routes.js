"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bookmark_controller_1 = require("./bookmark.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
router.get('/', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), bookmark_controller_1.BookmarkController.getBookmarksForUser);
router.post('/:listingId', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), bookmark_controller_1.BookmarkController.addBookmark);
router.delete('/:listingId', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), bookmark_controller_1.BookmarkController.removeBookmark);
exports.BookmarkRoutes = router;
