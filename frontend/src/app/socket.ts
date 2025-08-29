'use client'

import {io} from 'socket.io-client'

export const socket = io('http://localhost:4000', {
    autoConnect: false,
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"]
    }
});

// export socket;