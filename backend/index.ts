import { Server, Socket } from "socket.io";
import Fastify, { FastifyInstance } from "fastify";

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 20;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 5;

interface IBall {
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number
}

interface IPaddle {
    y: number,
    height: number,
    width: number,
    score: number
}


interface IGameState {
    ball: IBall,
    paddle1: IPaddle,
    paddle2: IPaddle,
    status: 'waiting' | 'playing' | 'ended'
    players: { [socketId: string]: 'player1' | 'player2' | 'spectator' },
    playersNb: number
}

let gameState: IGameState = {
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 5, dy: 5, radius: BALL_RADIUS },
    paddle1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    paddle2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, height: PADDLE_HEIGHT, width: PADDLE_WIDTH, score: 0 },
    status: 'waiting',
    players: {},
    playersNb: 0
};


let     gameInterval: NodeJS.Timeout | null = null;
const   INTERVAL = 1000 / 60;

function startGame() {
    if (gameInterval)
        return;
    gameState.status = 'playing';
    console.log("\nStarted the Game");
    gameInterval = setInterval(()=> {
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;
        
        if (gameState.ball.y - 10 <= 0 || gameState.ball.y + 10 >= GAME_HEIGHT) {
            gameState.ball.dy *= -1;
            // if (gameInterval)
            //     clearInterval(gameInterval);
        }
        if (gameState.ball.x - 10 <= 0 || gameState.ball.x + 10 >= GAME_WIDTH) {
            gameState.ball.dx *= -1;
            // if (gameInterval)
            //     clearInterval(gameInterval);
        }

        io.emit('gameStateUpdate', gameState);
    }, INTERVAL);
}


const io: Server = new Server(5000, {
    cors: {
        origin: ["http://localhost:3000"],
    }
});

const fastify: FastifyInstance = Fastify({ logger: true });


fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' });
});

fastify.listen({ port: 4000 }, function (err: Error | null, address: string) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Fastify server listening on ${address}`);
});

io.on('connection', (socket: Socket) => {
    console.log("Connected to socket ID: ", socket.id);

    io.emit('messageee', "Hello from the server ;)");

    socket.on('message', (msg: string) => {
        console.log("Message received: ", msg);
    });

    socket.on('disconnect', (reason: string) => {
        console.log(socket.id, " disconnected because: ", reason);
    });

    socket.on('play', () => {
        console.log("\nrecived Play\n");

        if (gameState.playersNb + 1 > 2)
            return;

        gameState.playersNb++;
        if (gameState.playersNb === 1)
            socket.emit('playerRole', 'Player 1');
        else {
            socket.emit('playerRole', 'Player 2');
            startGame();
        }
    });
});
