"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const env_1 = __importDefault(require("../config/env"));
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    let message = err.message || 'An unexpected error occurred.';
    // Create a structured error response
    const errorResponse = {
        success: false,
        message,
        errorDetails: err,
        stack: env_1.default.NODE_ENV === 'development' ? err.stack : undefined,
    };
    // Handle specific error types
    if (err instanceof zod_1.ZodError) {
        const issues = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        errorResponse.message = 'Validation Error';
        errorResponse.errorDetails = [...issues];
        statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    else if (err.name === 'CastError') {
        errorResponse.message = `Invalid ID: ${err.value}`;
        statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    else if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => el.message);
        errorResponse.message = `Invalid input data. ${errors.join('. ')}`;
        statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
    else if (err.name === 'JsonWebTokenError') {
        errorResponse.message = 'Invalid token. Please log in again.';
        statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
    else if (err.name === 'TokenExpiredError') {
        errorResponse.message = 'Your token has expired. Please log in again.';
        statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
    else if (!(err instanceof AppError_1.default)) {
        // For unhandled errors, provide a generic message in production
        if (env_1.default.NODE_ENV === 'production') {
            errorResponse.message = 'Something went wrong!';
            errorResponse.errorDetails = null;
        }
    }
    // Send the response
    res.status(statusCode).json(errorResponse);
};
exports.globalErrorHandler = globalErrorHandler;
