"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("./analytics.controller");
const router = express_1.default.Router();
router.get('/summary', analytics_controller_1.AnalyticsControllers.getAnalyticsSummary);
router.get('/user-growth', analytics_controller_1.AnalyticsControllers.getUserGrowth);
router.get('/top-listings', analytics_controller_1.AnalyticsControllers.getTopListings);
exports.AnalyticsRoutes = router;
