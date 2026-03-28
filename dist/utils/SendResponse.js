"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendResponse = void 0;
const SendResponse = (res, data) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        data: data.data,
        meta: data.meta,
    });
};
exports.SendResponse = SendResponse;
