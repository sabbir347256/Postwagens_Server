"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteListingMediaZodSchema = exports.updateListingZodSchema = exports.createListingZodSchema = void 0;
const zod_1 = require("zod");
const listing_interface_1 = require("./listing.interface");
exports.createListingZodSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    price: zod_1.z.coerce.number(),
    category: zod_1.z.nativeEnum(listing_interface_1.ListingCategory),
    condition: zod_1.z.string(),
    location: zod_1.z.string(),
    year: zod_1.z.coerce.number().optional(),
    mileage: zod_1.z.coerce.number().optional(),
    trans: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
});
exports.updateListingZodSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.coerce.number().optional(),
    category: zod_1.z.nativeEnum(listing_interface_1.ListingCategory).optional(),
    condition: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    sold: zod_1.z.boolean().optional(),
    isBoosted: zod_1.z.boolean().optional(),
    boostExpiresAt: zod_1.z.date().optional(),
    year: zod_1.z.coerce.number().optional(),
    mileage: zod_1.z.coerce.number().optional(),
    trans: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
});
exports.deleteListingMediaZodSchema = zod_1.z.object({
    listingId: zod_1.z.string(),
    mediaUrl: zod_1.z.string(),
});
