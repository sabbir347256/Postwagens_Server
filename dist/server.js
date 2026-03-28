"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("../src/config/env"));
const redis_config_1 = require("./config/redis.config");
const db_1 = __importDefault(require("../src/config/db"));
const socket_1 = require("./socket/socket");
let server;
dotenv_1.default.config();
const PORT = env_1.default.PORT || 3002;
const startServer = async () => {
    try {
        await (0, db_1.default)();
        server = app_1.default.listen(PORT, () => {
            console.log(`Server started on http://localhost:${PORT}`);
        });
        (0, socket_1.initSocket)(server);
    }
    catch (error) {
        console.log(error);
    }
};
// Booom and start the server
(async () => {
    await (0, redis_config_1.connectRedis)();
    await startServer();
})();
// SIGTERM signal detected and close the server
process.on('SIGTERM', () => {
    console.log('SIGTERM SIGNAL FOUND and server shutting down...');
    if (server) {
        server.close(() => {
            // server closing
            console.log('server closed');
            process.exit(1); // exit from server
        });
    }
    else {
        process.exit(1);
    }
});
// SIGINT signal send
process.on('SIGINT', (error) => {
    console.log('SIGINT SIGNAL FOUND your server might be closed and server shutting down...', error);
    if (server) {
        server.close(() => {
            // server closing
            console.log('server closed');
            process.exit(1); // exit from server
        });
    }
    else {
        process.exit(1);
    }
});
// Unhandled rejection eror
process.on('unhandledRejection', (error) => {
    console.log('Unhandled rejection detected and server shutting down...', error);
});
// Unhandled rejection eror
process.on('uncaughtException', (error) => {
    console.log('Uncaught exception detected and server shutting down...', error);
});
