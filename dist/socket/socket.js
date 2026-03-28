"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.getSocketIo = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const onlineUsers = new Map(); // <userId, socketId>
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Adjust this to your frontend's origin
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', socket => {
        console.log('a user connected', socket.id);
        // Join a room based on userId
        socket.on('join', userId => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            console.log(`User ${userId} joined with socket ID ${socket.id}`, onlineUsers.keys());
        });
        socket.on('disconnect', () => {
            console.log('user disconnected', socket.id);
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getSocketIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getSocketIo = getSocketIo;
const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
