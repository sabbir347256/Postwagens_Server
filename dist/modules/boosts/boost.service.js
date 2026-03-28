"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoostService = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const listing_model_1 = __importDefault(require("../listing/listing.model"));
const boost_model_1 = require("./boost.model");
// ListingBoost services
const boostListing = async (payload, userId) => {
    const { listingId, productId, name, price, duration, durationDays } = payload;
    const listing = await listing_model_1.default.findById(listingId);
    if (!listing) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Listing not found');
    }
    // Check for an existing active boost for this listing
    const existingBoost = await boost_model_1.Boost.findOne({
        listingId: listingId,
        endAt: { $gte: new Date() },
    });
    if (existingBoost) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'This listing is already boosted.');
    }
    const startAt = new Date();
    const endAt = new Date();
    endAt.setDate(startAt.getDate() + (durationDays || duration));
    // Create the boost document
    await boost_model_1.Boost.create({
        listingId,
        userId,
        productId,
        name,
        price,
        durationDays: durationDays || duration,
        startAt,
        endAt,
    });
    // Update the listing to set isBoosted to true
    const updatedListing = await listing_model_1.default.findByIdAndUpdate(listingId, { isBoosted: true }, { new: true });
    return updatedListing;
};
const getListingBoosts = async (listingId) => {
    const boosts = await boost_model_1.Boost.find({ listingId });
    return boosts;
};
const getUserBoosts = async (userId) => {
    const boosts = await boost_model_1.Boost.find({ userId }).populate('listingId userId');
    return boosts;
};
const getActiveBoosts = async () => {
    const boosts = await boost_model_1.Boost.find({ endAt: { $gte: new Date() } }).populate('listingId userId', 'fullName avatar isVerified title description price imagesAndVideos category location condition');
    return boosts;
};
const getRevenueOverview = async (year) => {
    const result = await boost_model_1.Boost.aggregate([
        {
            $match: {
                $expr: {
                    $eq: [{ $year: '$createdAt' }, year],
                },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                totalRevenue: { $sum: '$price' },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
            },
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                totalRevenue: 1,
            },
        },
    ]);
    return result;
};
exports.BoostService = {
    boostListing,
    getListingBoosts,
    getUserBoosts,
    getActiveBoosts,
    getRevenueOverview,
};
