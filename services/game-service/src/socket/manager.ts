// import { Server, Socket } from 'socket.io';
// import Fastify, { FastifyInstance } from 'fastify';
// import http from 'http';
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
// import {
//   handleJoinTournament,
//   handleCreateTournament,
//   handleRequestTournaments,
//   handleRequestTournamentDetails,
//   handleLeaveTournamentLobby,
// } from './tournamentHandlers';

// let ioInstance: Server;

// export function getIoInstance() {
//   return ioInstance;
// }

// export function initializeSocketIO(server: http.Server): Server {
//   const io: Server = new Server(server, {
//     path: '/ws/game',
//     cors: {
//       origin: '*',
//       methods: ['GET', 'POST'],
//     },
//   });
//   ioInstance = io;

//   io.on('connection', (socket: Socket) => {
//     console.log('recieved a new connection\n');
//     handleConnection(socket, io);
//     socket.on('play', (userId) => handlePlay(socket, userId));
//     socket.on('movePaddle', (gameId, playerRole, dir) =>
//       handleMovePaddle(gameId, playerRole, dir),
//     );
//     socket.on('gameOver', () => handleGameOver());
//     socket.on('disconnect', (reason) => handleDisconnect(socket, reason));
//     socket.on('rematch', (gameId, playerRole) =>
//       handleRematch(socket, gameId, playerRole),
//     );
//     socket.on('quit', (gameId, userId) => handleQuit(socket, gameId, userId));
//     socket.on('cancelMatching', (gameId) => handleCancelMatching(gameId));
//     socket.on(
//       'createTournament',
//       (userId: string, maxPlayer: number, name: string) =>
//         handleCreateTournament(socket, userId, maxPlayer, name),
//     );
//     socket.on('joinTournament', (userId, tournamentId) =>
//       handleJoinTournament(socket, userId, tournamentId),
//     );
//     socket.on('requestTournaments', () => handleRequestTournaments(socket));
//     socket.on(
//       'requestTournamentDetails',
//       (userId: string, tournamentId: string) =>
//         handleRequestTournamentDetails(socket, userId, tournamentId),
//     );
//     socket.on('leaveTournamentLobby', (userId: string, tournamentId: string) =>
//       handleLeaveTournamentLobby(socket, userId, tournamentId),
//     );
//   });

//   return io;
// }


// game-broker-handlers.ts (Game Service)

import IORedis from 'ioredis';

const publisher = new IORedis({ host: 'redis-broker' }); 
const subscriber = new IORedis({ host: 'redis-broker' }); 

const GAME_CHANNEL_IN = 'game_commands_in';
const CLIENT_CHANNEL_OUT = 'client_updates_out';

export function initializeGameBrokerHandlers() {
    subscriber.subscribe(GAME_CHANNEL_IN);

    subscriber.on('message', (channel, message) => {
        if (channel !== GAME_CHANNEL_IN) return;
        
        try {
            const command = JSON.parse(message);
            const { socketId, event, data }: {
                socketId:string,
                event:string,
                data: any
            } = command;
            
            // function to publish response back to the client
            const sendResponse = (target: string = socketId,clientEvent: string,  responseData: any) => {
                publisher.publish(CLIENT_CHANNEL_OUT, JSON.stringify({
                    targetSocketId: target,
                    event: clientEvent,
                    data: responseData
                }));
            };

            switch (event) {
                case 'connection':
                    console.log(`Game Service tracking new socket: ${socketId}`);
                    break;

                case 'play':
                    handlePlay(socketId, data.userId, sendResponse);
                    break;

                case 'movePaddle':
                    handleMovePaddle(data.gameId, data.playerRole, data.dir);
                    break;
                
                case 'rematch':
                    handleRematch(socketId, data.gameId, data.playerRole, sendResponse);
                    break;
                
                case 'cancelMatching':
                    handleCancelMatching(data.gameId);
                    break;

                case 'quit':
                    handleQuit(socketId, data.gameId, data.userId, data.playerRole, sendResponse);
                    break;
                
                    

                // case 'requestTournaments':
                //     const tournaments = fetchTournaments(); 
                //     sendResponse('tournamentsList', tournaments);
                //     break;

                // case 'disconnect':
                //     handleDisconnect(socketId, data.reason);
                //     break;
                    
                default:
                    console.warn(`Unhandled game command: ${event}`);
            }
        } catch (e) {
            console.error('Error processing game command from Redis !! :', e);
        }
    });
}

