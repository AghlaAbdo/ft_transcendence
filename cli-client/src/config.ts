import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 600;
export const TERM_WIDTH = 80;
export const TERM_HEIGHT = 20;
export const API_URL = process.env.API_URL;
export const SOCKET_URL =
  process.env.SOCKET_URL ;
