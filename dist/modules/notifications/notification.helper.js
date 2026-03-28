"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHelper = void 0;
const generateNotificationMessage = async (notification) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = notification.actorId;
    if (!actor) {
        return 'Unknown action';
    }
    switch (notification.type) {
        case 'like':
            return `${actor.fullName} liked your post.`;
        case 'comment':
            return `${actor.fullName} commented on your post.`;
        case 'follow':
            return `${actor.fullName} started following you.`;
        case 'listing':
            return `${actor.fullName} created a new listing.`;
        case 'message':
            return `${actor.fullName} sent you a message.`;
        default:
            return 'You have a new notification.';
    }
};
exports.NotificationHelper = {
    generateNotificationMessage,
};
