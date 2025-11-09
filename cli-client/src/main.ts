#!/usr/bin/env ts-node

import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import readline from 'readline';
import chalk from 'chalk';
import { IPlayerData } from './interfaces.js';
import { API_URL } from './config.js';
import { setupSocket } from './socket/manager.js';
import { setUpReadline } from './cli/readlineHandler.js';
import https from 'https';

export const playerData: IPlayerData = {
  user: null,
  opponent: null,
  gameId: null,
  paddle: null,
  opponentPaddle: null,
  role: null,
  gameStatus: null,
  inGame: false,
};

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // 👈 allows self-signed certs
  }),
});

async function login(email: string, password: string) {
  const res = await axiosInstance.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  console.log('res.data: ', res.data);
  return res.data;
}

async function main() {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q: string) =>
    new Promise<string>((res) => rl.question(q, (a) => res(a)));
  const email = process.env.CLI_USER || (await ask('email: '));
  const password = process.env.CLI_PASS || (await ask('Password: '));
  rl.close();

  let token: string | null = null;
  try {
    const data = await login(email, password);
    token = data.token;
    playerData.user = {
      id: String(data.user.id),
      username: data.user.username,
      level: data.user.level,
    };
    console.log('Logged in as', data.user.username);
  } catch (err: any) {
    console.error('Login failed:', err?.response?.data || err.message);
    process.exit(1);
  }

  const socket = setupSocket(token!);
  setUpReadline();
  process.on('SIGINT', () => {
    // socket.close();
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    if (playerData.gameStatus === 'matching') {
      console.log('sent cancel matching!');
      socket.emit('cancelMatching', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    }
    process.stdin.pause();
    console.log('\nGoodbye 👋');
    process.exit(0);
  });
}

main().catch((e) => {
  console.error('Fatal error', e);
  process.exit(1);
});
