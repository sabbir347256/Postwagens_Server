"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostController = void 0;
const http_status_codes_1 = require("http-status-codes");
const CatchAsync_1 = require("../../utils/CatchAsync");
const boost_service_1 = require("./boost.service");
const SendResponse_1 = require("../../utils/SendResponse");
// ListingBoost controllers
const boostListing = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    // @ts-ignore
    const userId = req.user.userId;
    const result = await boost_service_1.BoostService.boostListing(req.body, userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: 'Listing boosted successfully',
        data: result,
    });
});
const getListingBoosts = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const { listingId } = req.params;
    // @ts-ignore
    const result = await boost_service_1.BoostService.getListingBoosts(listingId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Listing boosts retrieved successfully',
        data: result,
    });
});
const getUserBoosts = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    // @ts-ignore
    const userId = req.user.userId;
    const result = await boost_service_1.BoostService.getUserBoosts(userId);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'User boosts retrieved successfully',
        data: result,
    });
});
const getActiveBoosts = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const result = await boost_service_1.BoostService.getActiveBoosts();
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Active boosts retrieved successfully',
        data: result,
    });
});
const getRevenueOverview = (0, CatchAsync_1.CatchAsync)(async (req, res) => {
    const year = Number(req.query.year || new Date().getFullYear());
    const result = await boost_service_1.BoostService.getRevenueOverview(year);
    (0, SendResponse_1.SendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Revenue overview retrieved successfully',
        data: result,
    });
});
exports.BoostController = {
    boostListing,
    getListingBoosts,
    getUserBoosts,
    getActiveBoosts,
    getRevenueOverview,
};
