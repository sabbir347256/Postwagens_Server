"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/users/user.routes");
const listing_routes_1 = require("../modules/listing/listing.routes");
const post_routes_1 = require("../modules/post/post.routes");
const comment_routes_1 = require("../modules/comments/comment.routes");
const bookmark_routes_1 = require("../modules/bookmarks/bookmark.routes");
const boost_routes_1 = require("../modules/boosts/boost.routes");
const conversation_routes_1 = require("../modules/conversations/conversation.routes");
const notifications_routes_1 = require("../modules/notifications/notifications.routes");
const notification_preferences_routes_1 = require("../modules/notification_preferences/notification_preferences.routes");
const analytics_routes_1 = require("../modules/analytics/analytics.routes");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    // Add your route modules here
    {
        path: '/auth',
        route: auth_routes_1.authRouter,
    },
    {
        path: '/users',
        route: user_routes_1.userRoutes,
    },
    {
        path: '/listings',
        route: listing_routes_1.listingRoutes,
    },
    {
        path: '/posts',
        route: post_routes_1.postRoutes,
    },
    {
        path: '/comments',
        route: comment_routes_1.CommentRoutes,
    },
    {
        path: '/bookmarks',
        route: bookmark_routes_1.BookmarkRoutes,
    },
    {
        path: '/boosts',
        route: boost_routes_1.BoostRoutes,
    },
    {
        path: '/conversations',
        route: conversation_routes_1.ConversationRoutes,
    },
    {
        path: '/notifications',
        route: notifications_routes_1.NotificationRoutes,
    },
    {
        path: '/notification-preferences',
        route: notification_preferences_routes_1.NotificationPreferenceRoutes,
    },
    {
        path: '/admin/analytics',
        route: analytics_routes_1.AnalyticsRoutes,
    },
];
moduleRoutes.forEach(routeModule => {
    exports.router.use(routeModule.path, routeModule.route);
});
