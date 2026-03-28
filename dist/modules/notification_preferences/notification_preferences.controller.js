"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferenceController = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const notification_preferences_service_1 = require("./notification_preferences.service");
const SendResponse_1 = require("../../utils/SendResponse");
const http_status_codes_1 = require("http-status-codes");
const getMyPreferences = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const result = await notification_preferences_service_1.NotificationPreferenceService.getPreferences(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Notification preferences retrieved successfully',
        data: result,
    });
});
const updateMyPreferences = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const { preferences } = req.body;
    const result = await notification_preferences_service_1.NotificationPreferenceService.updatePreferences(userId, preferences);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Notification preferences updated successfully',
        data: result,
    });
});
exports.NotificationPreferenceController = {
    getMyPreferences,
    updateMyPreferences,
};
