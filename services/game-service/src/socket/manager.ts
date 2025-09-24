import { Server, Socket } from 'socket.io';
import Fastify, { FastifyInstance } from 'fastify';
import http from 'http';
import {
  handleConnection,
  handlePlay,
  handleMovePaddle,
  handleGameOver,
  handleDisconnect,
  handleRematch,
  handleQuit,
} from './handlers';

export function initializeSocketIO(server: http.Server): Server {
  const io: Server = new Server(server, {
    path: '/ws/game',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('recieved a new connection\n');
    handleConnection(socket, io);
    socket.on('play', () => handlePlay(socket));
    socket.on('movePaddle', (gameId, playerRole, dir) =>
      handleMovePaddle(gameId, playerRole, dir),
    );
    socket.on('gameOver', () => handleGameOver());
    socket.on('disconnect', (reason) => handleDisconnect(socket, reason));
    socket.on('rematch', (gameId, playerRole) =>
      handleRematch(socket, gameId, playerRole),
    );
    socket.on('quit', (gameId) => handleQuit(socket, gameId));
  });

  return io;
}
