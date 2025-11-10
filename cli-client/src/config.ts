import dotenv from 'dotenv';
dotenv.config();

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 600;
export const TERM_WIDTH = 80;
export const TERM_HEIGHT = 20;
export const API_URL = process.env.API_URL || 'https://localhost:8080/api';
export const SOCKET_URL =
  process.env.SOCKET_URL || 'https://localhost:8080/ws/game';
export const CLI_EMAIL = process.env.CLI_EMAIL;
export const CLI_PASS = process.env.CLI_PASS;
