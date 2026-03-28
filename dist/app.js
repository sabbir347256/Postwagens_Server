"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = __importDefault(require("./config/env"));
require("./config/passport.config");
const routes_1 = require("./routes");
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const NotFound_1 = require("./middlewares/NotFound");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("combined"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(safeSanitizeMiddleware);
// THROTTLING
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.default.REQUEST_RATE_LIMIT_TIME * 60 * 1000, // Assuming time in minutes from env
    max: env_1.default.REQUEST_RATE_LIMIT,
    message: {
        success: false,
        statusCode: 400,
        message: 'Too many requests, please try again later.',
    },
});
app.use(limiter);
// GLOBAL ROUTES
app.use('/api/v1', routes_1.router);
// Routes
app.get("/", (_, res) => {
    res.json({
        status: "success",
        message: "I am alive! 🎉",
    });
});
// NO ROUTE MATCH
app.use(NotFound_1.NotFound);
// GLOBAL ERROR HANDLER
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
