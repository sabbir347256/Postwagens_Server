"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const boost_controller_1 = require("./boost.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const user_interface_1 = require("../users/user.interface");
const router = express_1.default.Router();
// ListingBoost routes
router.post('/', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), boost_controller_1.BoostController.boostListing);
router.get('/active', boost_controller_1.BoostController.getActiveBoosts);
router.get('/user', (0, auth_middleware_1.checkAuth)(...Object.values(user_interface_1.Role)), boost_controller_1.BoostController.getUserBoosts);
router.get('/listing/:listingId', boost_controller_1.BoostController.getListingBoosts);
router.get('/revenue-overview', (0, auth_middleware_1.checkAuth)(user_interface_1.Role.ADMIN), boost_controller_1.BoostController.getRevenueOverview);
exports.BoostRoutes = router;
