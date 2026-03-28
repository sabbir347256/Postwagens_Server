"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTargetRole = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["MESSAGE"] = "message";
    NotificationType["LIKE"] = "like";
    NotificationType["COMMENT"] = "comment";
    NotificationType["LISTING"] = "listing";
    NotificationType["PAYMENT"] = "payment";
    NotificationType["USER_REGISTER"] = "user_register";
    NotificationType["FOLLOW"] = "follow";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationTargetRole;
(function (NotificationTargetRole) {
    NotificationTargetRole["ADMIN"] = "admin";
    NotificationTargetRole["USER"] = "user";
})(NotificationTargetRole || (exports.NotificationTargetRole = NotificationTargetRole = {}));
