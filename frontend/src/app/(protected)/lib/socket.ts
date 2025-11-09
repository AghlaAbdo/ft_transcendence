'use client';

import { io } from 'socket.io-client';


export const socket = io({
  path: '/ws/game',
  autoConnect: false,
  withCredentials: true
});

socket.on("connect_error", (err) => {
  console.log("Couldn't connect to game socket");
  if (err.message === "NO_TOKEN") {
    console.log("User not logged in.");
  }
  if (err.message === "INVALID_TOKEN") {
    console.log("Token expired or invalid.");
  }
});
