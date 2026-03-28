"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const conversation_controller_1 = require("./conversation.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("../users/user.interface");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
router.get('/', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), conversation_controller_1.ConversationController.getConversationsForUser);
router.get('/:conversationId/messages', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), conversation_controller_1.ConversationController.getMessagesForConversation);
router.post('/messages', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), multer_config_1.multerUpload.single('media'), conversation_controller_1.ConversationController.sendMessage);
router.post('/find-or-create', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), conversation_controller_1.ConversationController.findOrCreateConversation);
exports.ConversationRoutes = router;
