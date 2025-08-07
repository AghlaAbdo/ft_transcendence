import { Server, Socket } from "socket.io";
import {
    handleConnection,
    handlePlay,
    handleMoveUp,
    handleMoveDown,
    handleStopGame,
    handleDisconnect,
 } from "./gameHandlers";

 export function initializeSocketIO(httpsServer: any): Server {
    const io: Server = new Server(5000, {
        cors: {
            origin: ["http://localhost:3000"]
        }
    })

    io.on('connection', (socket: Socket)=> {
        console.log("recieved a new connection\n");
        // -------- Start of Pong Game events --------
        handleConnection(socket, io);
        socket.on('play', ()=> handlePlay(socket));
        socket.on('moveUp', (playerRole)=> handleMoveUp(playerRole));
        socket.on('moveDown', (playerRole)=> handleMoveDown(playerRole));
        socket.on('stopGame', ()=> handleStopGame());
        // -------- End of Pong Game events --------
        socket.on('disconnect', (reason)=> handleDisconnect(socket, reason));
    });

    return io;
 }