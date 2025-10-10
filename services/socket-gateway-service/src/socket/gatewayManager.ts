// socket/gateway-manager.ts

import { Server, Socket } from 'socket.io';
import http from 'http';
import IORedis from 'ioredis';
import {setMapping, removeMapping} from '../utils/userSocketMapping'

const publisher = new IORedis({ host: 'redis-broker' });
const subscriber = new IORedis({ host: 'redis-broker' });

let ioInstance: Server;
const OUTGOING_CHANNEL = 'client_updates_out';
const GAME_CHANNEL_IN = 'game_commands_in';


function publishToGameService(socketId: string, event: string, payload: any = {}) {
    publisher.publish(GAME_CHANNEL_IN, JSON.stringify({
        socketId: socketId,
        event: event,
        data: payload
    }));
}

export function initializeSocketIOGateway(server: http.Server): Server {
    const io: Server = new Server(server, {
        path: '/ws',
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    ioInstance = io;

    // --- Microservice to Client Flow ---
    subscriber.subscribe(OUTGOING_CHANNEL);
    subscriber.on('message', (channel, message) => {
        if (channel === OUTGOING_CHANNEL) {
            try {
                const { targetSocketId, event, data } = JSON.parse(message);
                
                if (event === 'joinRoom') {
                    io.in(targetSocketId).socketsJoin(data.roomId);
                } else if (event === 'leaveRoom') {
                    io.in(targetSocketId).socketsLeave(data.roomId);
                } else if (targetSocketId === 'all') {
                    io.emit(event, data);
                } else if (targetSocketId) {
                    io.to(targetSocketId).emit(event, data);
                }
            } catch (e) {
                console.error('Error parsing microservice message:', e);
            }
        }
    });

    // --- Client to Microservice Flow ---
    
   io.on('connection', (socket: Socket) => {
    console.log('Received a new connection via Gateway');
    
    // --- Game events: ---

    publishToGameService(socket.id, 'connection');
    socket.on('game:play', (userId) => {
        publishToGameService(socket.id, 'play', { userId });
    });
    socket.on('game:movePaddle', (gameId, playerRole, dir) => {
        publishToGameService(socket.id, 'movePaddle', { gameId, playerRole, dir });
    });
    socket.on('game:rematch', (gameId, playerRole) => {
        publishToGameService(socket.id, 'rematch', { gameId, playerRole });
    });
    socket.on('game:quit', (gameId, userId) => {
        console.log("got Quit event !!");
        publishToGameService(socket.id, 'quit', { gameId, userId });
    });
    socket.on('game:cancelMatching', (gameId) => {
        publishToGameService(socket.id, 'cancelMatching', { gameId });
    });
    socket.on('disconnect', (reason) => {
        publishToGameService(socket.id, 'disconnect', { reason });
    });

    // --- Tournament Events ---

    // socket.on('createTournament', (userId: string, maxPlayer: number, name: string) => {
    //     publishToGameService(socket.id, 'createTournament', { userId, maxPlayer, name });
    // });

    // socket.on('joinTournament', (userId, tournamentId) => {
    //     publishToGameService(socket.id, 'joinTournament', { userId, tournamentId });
    // });
    
    // socket.on('requestTournaments', () => {
    //     // Note: Requests for data often use a unique replyTo channel for the response
    //     publishToGameService(socket.id, 'requestTournaments');
    // });

    // socket.on('requestTournamentDetails', (userId: string, tournamentId: string) => {
    //     publishToGameService(socket.id, 'requestTournamentDetails', { userId, tournamentId });
    // });

    // socket.on('leaveTournamentLobby', (userId: string, tournamentId: string) => {
    //     publishToGameService(socket.id, 'leaveTournamentLobby', { userId, tournamentId });
    // });
  });
  return io;
}