"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsync = void 0;
const CatchAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    }
    catch (error) {
        next(error);
    }
};
exports.CatchAsync = CatchAsync;
