import { Socket, io } from 'socket.io-client';
import chalk from 'chalk';
import { IGameState, IPlayer } from '../interfaces.js';
import {
  handleConnect,
  handleGameStateUpdate,
  handleMatchDetails,
  handleMatchFound,
  handlePlayerData,
} from './handlers.js';

export let socket: Socket;

export function setupSocket(token: string): Socket {
  socket = io('wss://localhost:8080', {
    path: '/ws/game',
    auth: { token },
    transports: ['websocket'],
    rejectUnauthorized: false,
    reconnectionAttempts: 2,
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
    handleConnect(socket);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Connect error:', err.message);
  });

  socket.on('playerData', (data) => {
    handlePlayerData(data);
  });

  socket.on('matchFound', (opponent: IPlayer) => {
    handleMatchFound(socket, opponent);
  });

  socket.on('starting', (num: number) => {
    console.log('Starting in ', chalk.bold.yellow(String(num)));
  });

  socket.on('gameStateUpdate', (state: IGameState) => {
    handleGameStateUpdate(socket, state);
  });

  socket.on('opponentQuit', (status) => {
    console.log('Opponent quit. game status:', status);
  });

  socket.on('matchDetails', (data: { gameStatus: string }) => {
    handleMatchDetails(socket, data);
  });

  socket.on('inAnotherGame', () => {
    console.log(chalk.red('You are already in another game!'));
  });

  return socket;
}
