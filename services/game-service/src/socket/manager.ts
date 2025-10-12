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
  handleCancelMatching,
} from './handlers';
import {
  handleJoinTournament,
  handleCreateTournament,
  handleRequestTournaments,
  handleRequestTournamentDetails,
  handleLeaveTournamentLobby,
  handleTournPlayerInLoby,
  handleReadyForMatch,
} from './tournamentHandlers';

let ioInstance: Server;

export function getIoInstance() {
  return ioInstance;
}

export function initializeSocketIO(server: http.Server): Server {
  const io: Server = new Server(server, {
    path: '/ws/game',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log('recieved a new connection\n');
    handleConnection(socket, io);
    socket.on('play', (userId) => handlePlay(socket, userId));
    socket.on('movePaddle', (gameId, playerRole, dir) =>
      handleMovePaddle(gameId, playerRole, dir),
    );
    socket.on('gameOver', () => handleGameOver());
    socket.on('disconnect', (reason) => handleDisconnect(socket, reason));
    socket.on('rematch', (gameId, playerRole) =>
      handleRematch(socket, gameId, playerRole),
    );
    socket.on('quit', (gameId, userId) => handleQuit(socket, gameId, userId));
    socket.on('cancelMatching', (gameId) => handleCancelMatching(gameId));
    socket.on(
      'createTournament',
      (userId: string, maxPlayer: number, name: string) =>
        handleCreateTournament(socket, userId, maxPlayer, name),
    );
    socket.on('joinTournament', (userId, tournamentId) =>
      handleJoinTournament(socket, userId, tournamentId),
    );
    socket.on('requestTournaments', () => handleRequestTournaments(socket));
    socket.on(
      'requestTournamentDetails',
      (userId: string, tournamentId: string) =>
        handleRequestTournamentDetails(socket, userId, tournamentId),
    );
    socket.on('leaveTournamentLobby', (userId: string, tournamentId: string) =>
      handleLeaveTournamentLobby(socket, userId, tournamentId),
    );
    socket.on('tourn:inLoby', (data: { tournamentId: string }) =>
      handleTournPlayerInLoby(socket, data),
    );
    socket.on(
      'tourn:readyForMatch',
      (data: { userId: string; tournamentId: string; gameId: string }) =>
        handleReadyForMatch(socket, data),
    );
  });

  return io;
}
