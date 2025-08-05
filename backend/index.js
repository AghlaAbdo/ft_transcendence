"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var fastify_1 = require("fastify");
var GAME_WIDTH = 900;
var GAME_HEIGHT = 600;
var PADDLE_HEIGHT = 150;
var PADDLE_WIDTH = 30;
var BALL_RADIUS = 20;
var PADDLE_SPEED = 14;
var gameState = {
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 5, dy: 5, radius: BALL_RADIUS },
    paddle1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    paddle2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    status: 'waiting',
    players: {},
    playersNb: 0
};
var gameInterval = null;
var INTERVAL = 500 / 60;
function startGame() {
    if (gameInterval)
        return;
    gameState.status = 'playing';
    console.log("\nStarted the Game");
    gameInterval = setInterval(function () {
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;
        if (gameState.ball.y - 10 <= 0 || gameState.ball.y + 10 >= GAME_HEIGHT) {
            gameState.ball.dy *= -1;
        }
        if (gameState.ball.x - 10 <= 0 || gameState.ball.x + 10 >= GAME_WIDTH) {
            gameState.ball.dx *= -1;
        }
        io.emit('gameStateUpdate', gameState);
    }, INTERVAL);
}
var io = new socket_io_1.Server(5000, {
    cors: {
        origin: ["http://localhost:3000"],
    }
});
var fastify = (0, fastify_1.default)({ logger: true });
fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' });
});
fastify.listen({ port: 4000 }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log("Fastify server listening on ".concat(address));
});
io.on('connection', function (socket) {
    console.log("Connected to socket ID: ", socket.id);
    io.emit('messageee', "Hello from the server ;)");
    socket.on('message', function (msg) {
        console.log("Message received: ", msg);
    });
    socket.on('disconnect', function (reason) {
        console.log(socket.id, " disconnected because: ", reason);
    });
    socket.on('play', function () {
        console.log("\nrecived Play\n");
        if (gameState.playersNb + 1 > 2)
            return;
        gameState.playersNb++;
        if (gameState.playersNb === 1)
            socket.emit('playerRole', 'player1');
        else {
            socket.emit('playerRole', 'player2');
            startGame();
        }
    });
    socket.on('moveUp', function (playerRole) {
        console.log("Move Up, Player Role: ", playerRole);
        if (playerRole === 'player1') {
            if (gameState.paddle1.y - PADDLE_SPEED > 0)
                gameState.paddle1.y -= PADDLE_SPEED;
        }
        else {
            if (gameState.paddle2.y - PADDLE_SPEED > 0)
                gameState.paddle2.y -= PADDLE_SPEED;
        }
    });
    socket.on('moveDown', function (playerRole) {
        console.log("Move Down, Player Role: ", playerRole);
        if (playerRole === 'player1') {
            if (gameState.paddle1.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
                gameState.paddle1.y += PADDLE_SPEED;
        }
        else {
            if (gameState.paddle2.y + PADDLE_HEIGHT + PADDLE_SPEED < GAME_HEIGHT)
                gameState.paddle2.y += PADDLE_SPEED;
        }
    });
    socket.on('stopGame', function () {
        console.log("\nstop game");
    });
});
