'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
var socket_io_client_1 = require("socket.io-client");
exports.socket = (0, socket_io_client_1.io)('http://localhost:5000', {
    autoConnect: false,
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"]
    }
});
