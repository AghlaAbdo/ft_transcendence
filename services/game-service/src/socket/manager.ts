import { Server, Socket } from 'socket.io';
import {
  handleConnection,
  handlePlay,
  handleMovePaddle,
  handleGameOver,
  handleDisconnect,
} from './handlers';

export function initializeSocketIO(): Server {
  const io: Server = new Server(5000, {
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
