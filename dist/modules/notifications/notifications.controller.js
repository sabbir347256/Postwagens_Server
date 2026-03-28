"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const notifications_service_1 = require("./notifications.service");
const SendResponse_1 = require("../../utils/SendResponse");
const http_status_codes_1 = require("http-status-codes");
const getMyNotifications = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    const { type, page, limit } = req.query;
    const result = await notifications_service_1.NotificationService.getNotificationsForUser(userId, {
        type: type,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    });
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Notifications retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const markAsRead = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { notificationId } = req.params;
    // @ts-ignore
    const result = await notifications_service_1.NotificationService.markAsRead(notificationId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Notification marked as read',
        data: result,
    });
});
const markAllAsRead = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.user;
    await notifications_service_1.NotificationService.markAllAsRead(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'All notifications marked as read',
        data: null,
    });
});
exports.NotificationController = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
