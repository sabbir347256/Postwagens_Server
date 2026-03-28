"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const bookmark_model_1 = require("./bookmark.model");
const listing_model_1 = __importDefault(require("../listing/listing.model"));
const addBookmark = async (listingId, userId) => {
    const listing = await listing_model_1.default.findById(listingId);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    const alreadyBookmarked = await bookmark_model_1.Bookmark.findOne({ listingId, userId });
    if (alreadyBookmarked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'Listing already bookmarked');
    }
    const result = await bookmark_model_1.Bookmark.create({ listingId, userId });
    return result;
};
const removeBookmark = async (listingId, userId) => {
    const listing = await listing_model_1.default.findById(listingId);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    const bookmarked = await bookmark_model_1.Bookmark.findOne({ listingId, userId });
    if (!bookmarked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not bookmarked yet');
    }
    await bookmark_model_1.Bookmark.findByIdAndDelete(bookmarked._id);
    return null;
};
const getBookmarksForUser = async (userId) => {
    const result = await bookmark_model_1.Bookmark.find({ userId }).populate('listingId');
    return result;
};
exports.BookmarkService = {
    addBookmark,
    removeBookmark,
    getBookmarksForUser,
};
