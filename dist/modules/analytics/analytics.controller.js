"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsControllers = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const analytics_service_1 = require("./analytics.service");
const SendResponse_1 = require("../../utils/SendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getAnalyticsSummary = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await analytics_service_1.AnalyticsServices.getAnalyticsSummary();
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Analytics summary fetched successfully',
        data: result,
    });
});
const getUserGrowth = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { range } = req.query;
    const result = await analytics_service_1.AnalyticsServices.getUserGrowth(range);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'User growth fetched successfully',
        data: result,
    });
});
const getTopListings = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await analytics_service_1.AnalyticsServices.getTopListings();
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Top listings fetched successfully',
        data: result,
    });
});
exports.AnalyticsControllers = {
    getAnalyticsSummary,
    getUserGrowth,
    getTopListings,
};
