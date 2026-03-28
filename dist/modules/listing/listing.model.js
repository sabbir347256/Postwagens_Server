"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const listing_interface_1 = require("./listing.interface");
const listingSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imagesAndVideos: [
        {
            type: { type: String, enum: ['image', 'video'], required: true },
            url: { type: String, required: true },
        },
    ],
    category: {
        type: String,
        enum: Object.values(listing_interface_1.ListingCategory),
        required: true,
    },
    condition: { type: String, required: true },
    location: { type: String, required: true },
    sold: { type: Boolean, default: false },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'user', required: true },
    isBoosted: { type: Boolean, default: false },
    viewCount: {
        type: Number,
        default: 0,
    },
    inquiryCount: {
        type: Number,
        default: 0,
    },
    year: { type: Number, default: null },
    mileage: { type: Number, default: null },
    trans: { type: String, default: null },
    color: { type: String, default: null },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    }
});
listingSchema.virtual('seller', {
    ref: 'user',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
});
listingSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.sellerId;
        return ret;
    }
});
listingSchema.index({ title: 'text', description: 'text', location: 'text' });
// listingSchema.post('findOne', async function (doc: any) {
//   if (doc) {
//     const boost = await Boost.findOne({ listingId: doc._id, endAt: { $gte: new Date() } });
//     doc.isBoosted = !!boost;
//   }
// });
// listingSchema.post('find', async function (docs: any[]) {
//   if (docs && docs.length) {
//     const listingIds = docs.map(doc => doc._id);
//     const boosts = await Boost.find({ listingId: { $in: listingIds }, endAt: { $gte: new Date() } });
//     const boostedListingIds = new Set(boosts.map(boost => boost.listingId.toString()));
//     for (const doc of docs) {
//       doc.isBoosted = boostedListingIds.has(doc._id.toString());
//     }
//   }
// });
const Listing = (0, mongoose_1.model)('Listing', listingSchema);
exports.default = Listing;
