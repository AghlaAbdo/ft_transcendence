'use client'

import { Shippori_Antique } from 'next/font/google';
import {io} from 'socket.io-client'

export const socket = io({
  path: "/ws/game",
  autoConnect: false,
});

