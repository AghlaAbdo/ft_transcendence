import { Server, Socket } from 'socket.io';
import Fastify, { FastifyInstance } from 'fastify';
import http from 'http';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import {
  handleConnection,
  handlePlay,
  handleMovePaddle,
  handleGameOver,
  handleDisconnect,
  handleRematch,
  handleQuit,
  handleCancelMatching,
  handleRequestGameState,
  hancleQuitRemoteGamePage,
  handleGetGameInviteMatch,
  handleLeaveGameInvite,
} from './handlers';
import {
  handleJoinTournament,
  handleCreateTournament,
  handleRequestTournaments,
  handleRequestTournamentDetails,
  handleLeaveTournamentLobby,
  handleTournPlayerInLoby,
  handleReadyForMatch,
  handleQuitTournament,
  handleRequestTournMatchDetails,
  handleUnreadyForMatch,
} from './tournamentHandlers';
import { JWT_SECRET } from '../config/env';

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

  io.use((socket, next) => {
    let token: string | undefined;

    // 1. Browser: token sent in HttpOnly cookie
    // console.log("socket.handshake: ", socket.handshake);
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      const cookies = cookie.parse(cookieHeader);
      token = cookies.token;
    }

    // 2. CLI: token sent via auth object
    if (!token) {
      token = socket.handshake.auth?.token;
    }

    if (!token) return next(new Error('NO_TOKEN'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        username: string;
      };
      // console.log("Decoded token: ", decoded);
      (handleConnection(socket, io, String(decoded.id)), next());
    } catch (err) {
      return next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('recieved a new connection\n');
    socket.on('play', (userId) => handlePlay(socket, userId));
    socket.on('movePaddle', (gameId, playerRole, dir) =>
      handleMovePaddle(gameId, playerRole, dir),
    );
    socket.on('gameOver', () => handleGameOver());
    socket.on('disconnect', (reason) => handleDisconnect(socket, reason));
    socket.on('rematch', (gameId, playerRole, userId) =>
      handleRematch(socket, gameId, playerRole, userId),
    );
    socket.on(
      'quit',
      (data: { userId: string; gameId: string; opponentId?: string }) =>
        handleQuit(data),
    );
    socket.on('cancelMatching', (data: { userId: string; gameId: string }) =>
      handleCancelMatching(data),
    );
    socket.on('requestMatchDetails', (userId: string) =>
      handleRequestGameState(socket, userId),
    );
    socket.on(
      'quitRemoteGamePage',
      (data: { userId: string; gameId: string }) =>
        hancleQuitRemoteGamePage(data),
    );

    // -------- Tournament --------
    socket.on(
      'createTournament',
      (userId: string, maxPlayer: number, name: string) =>
        handleCreateTournament(socket, userId, maxPlayer, name),
    );
    socket.on('joinTournament', (userId, tournamentId) =>
      handleJoinTournament(socket, userId, tournamentId),
    );
    socket.on('requestTournaments', (data: { userId: string }) =>
      handleRequestTournaments(socket, data),
    );
    socket.on(
      'requestTournamentDetails',
      (userId: string, tournamentId: string) =>
        handleRequestTournamentDetails(socket, userId, tournamentId),
    );
    socket.on(
      'leaveTournamentLobby',
      (data: { userId: string; tournamentId: string }) =>
        handleLeaveTournamentLobby(socket, data),
    );
    socket.on(
      'tourn:inLoby',
      (data: { userId: string; tournamentId: string }) =>
        handleTournPlayerInLoby(socket, data),
    );
    socket.on(
      'tourn:readyForMatch',
      (data: { userId: string; tournamentId: string; gameId: string }) =>
        handleReadyForMatch(socket, data),
    );
    socket.on(
      'quitTournament',
      (data: { userId: string; tournamentId: string }) =>
        handleQuitTournament(data),
    );
    socket.on(
      'requestTournMatchDetails',
      (data: { userId: string; tournamentId: string; matchGameId: string }) =>
        handleRequestTournMatchDetails(socket, data),
    );
    socket.on('unreadyForMatch', (data: { userId: string }) =>
      handleUnreadyForMatch(data),
    );

    // ------------ GAme INvite ------------
    socket.on(
      'getGameInviteMatch',
      (data: { gameId: string; userId: string }) =>
        handleGetGameInviteMatch(socket, data),
    );
    socket.on('leaveGameInvite', (data: { userId: string; gameId: string }) => {
      handleLeaveGameInvite(data);
    });
  });

  return io;
}
