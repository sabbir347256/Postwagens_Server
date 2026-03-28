"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkController = void 0;
const http_status_codes_1 = require("http-status-codes");
const CatchAsync_1 = require("../../utils/CatchAsync");
const bookmark_service_1 = require("./bookmark.service");
const SendResponse_1 = require("../../utils/SendResponse");
const addBookmark = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { listingId } = req.params;
    // @ts-ignore
    const userId = req.user.userId;
    // @ts-ignore
    const result = await bookmark_service_1.BookmarkService.addBookmark(listingId, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Listing bookmarked successfully',
        data: result,
    });
});
const removeBookmark = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { listingId } = req.params;
    // @ts-ignore
    const userId = req.user.userId;
    // @ts-ignore
    await bookmark_service_1.BookmarkService.removeBookmark(listingId, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Listing bookmark removed successfully',
        data: null,
    });
});
const getBookmarksForUser = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    // @ts-ignore
    const userId = req.user.userId;
    const result = await bookmark_service_1.BookmarkService.getBookmarksForUser(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Bookmarks retrieved successfully',
        data: result,
    });
});
exports.BookmarkController = {
    addBookmark,
    removeBookmark,
    getBookmarksForUser,
};
