import { Server, Socket } from 'socket.io';
import Fastify, { FastifyInstance } from 'fastify';
import http from 'http'
import {
  handleConnection,
  handlePlay,
  handleMovePaddle,
  handleGameOver,
  handleDisconnect,
} from './handlers';

export function initializeSocketIO(server: http.Server): Server {
  console.log("fastify.server : " , server);
  
  const io: Server = new Server(server, {
    cors: {
      origin: ['http://localhost:3000'],
    },
  }); 

  io.on('connection', (socket: Socket) => {
    console.log('recieved a new connection\n');
    // -------- Start of Pong Game events --------
    handleConnection(socket, io);
    socket.on('play', () => handlePlay(socket));
    socket.on('movePaddle', (gameId, playerRole, dir) =>
      handleMovePaddle(gameId, playerRole, dir),
    );
    socket.on('gameOver', () => handleGameOver());
    // -------- End of Pong Game events --------
    socket.on('disconnect', (reason) => handleDisconnect(socket, reason));
  });

  return io;
}
