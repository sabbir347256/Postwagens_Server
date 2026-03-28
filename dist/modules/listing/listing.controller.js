"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingControllers = void 0;
const CatchAsync_1 = require("../../utils/CatchAsync");
const SendResponse_1 = require("../../utils/SendResponse");
const listing_service_1 = require("./listing.service");
const http_status_codes_1 = require("http-status-codes");
// Create Listing
const createListing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await listing_service_1.listingServices.createListingService(req.body, req.user, req.files);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        message: 'Listing created successfully!',
        data: result,
    });
});
// Get My Listings
const getMyListings = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await listing_service_1.listingServices.getMyListingsService(req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'My listings fetched successfully!',
        data: result,
    });
});
// Get All Listings
const getAllListings = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const sanitizedQuery = {};
    for (const key in req.query) {
        const value = req.query[key];
        if (typeof value === 'string') {
            sanitizedQuery[key] = value;
        }
        else if (Array.isArray(value)) {
            sanitizedQuery[key] = value.join(',');
        }
    }
    const user = req.user;
    const { meta, result } = await listing_service_1.listingServices.getAllListingsService(sanitizedQuery, user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listings fetched successfully!',
        meta,
        data: result,
    });
});
// Get Single Listing
const getSingleListing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await listing_service_1.listingServices.getSingleListingService(id, user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listing fetched successfully!',
        data: result,
    });
});
// Update Listing
const updateListing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await listing_service_1.listingServices.updateListingService(id, req.body, req.user, req.files);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listing updated successfully!',
        data: result,
    });
});
// Get Listings By User Id
const getListingsByUserId = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { userId } = req.params;
    const result = await listing_service_1.listingServices.getListingsByUserIdService(userId);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listings fetched successfully!',
        data: result,
    });
});
// Delete Listing
const deleteListing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    await listing_service_1.listingServices.deleteListingService(id, req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listing deleted successfully!',
        data: null,
    });
});
// Delete Listing Media
const deleteListingMedia = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { listingId, mediaUrl } = req.query;
    const result = await listing_service_1.listingServices.deleteListingMediaService(listingId, mediaUrl, req.user);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listing media deleted successfully!',
        data: result,
    });
});
// Get Listing Analytics
const getListingAnalytics = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await listing_service_1.listingServices.getListingAnalyticsService(id);
    (0, SendResponse_1.SendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Listing analytics fetched successfully!',
        data: result,
    });
});
exports.listingControllers = {
    createListing,
    getMyListings,
    getAllListings,
    getSingleListing,
    updateListing,
    deleteListing,
    getListingsByUserId,
    deleteListingMedia,
    getListingAnalytics,
};
