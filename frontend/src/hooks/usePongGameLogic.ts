import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "@/app/socket"
import { IGameState, GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS } from "@/constants/game";

interface returnType {
    handlePlayBtn: () => void,
    handleStopBtn: () => void,
    refCanvas: React.RefObject<HTMLCanvasElement | null>,
}

export const usePongGameLogic = (): returnType => {
    const refCanvas = useRef<HTMLCanvasElement>(null);
    const pressedKeys = useRef<Set<string>>(new Set());
    const animationFrameId = useRef<number | null>(null);
    let   isPlaying = useRef<boolean>(false);
    let   playerRole = useRef<"player1" | "player2">(null);
    
    
    useEffect(() => {
        socket.connect();
        socket.on('connect', () => {
            console.log('Connected to Socket.IO server!');
            console.log('Socket ID:', socket.id);
        });
        socket.on('playerRole', (msg) => {
            console.log("player role: ", msg);
            playerRole.current = msg;
        });
        socket.on('gameStateUpdate', (gameState: IGameState) => {
            drawGame(gameState);
        });
        socket.on('gameOver', ()=> {
            isPlaying.current = false;

        });
        window.addEventListener('keydown', keydownEvent);
        window.addEventListener('keyup', keyupEvent);
        return () => {
            window.removeEventListener('keydown', keydownEvent);
            window.removeEventListener('keyup', keyupEvent);
            socket.disconnect();
        };
    }, [])

    const drawGame = useCallback((gameState: IGameState) => {
        const canvas: HTMLCanvasElement | null = refCanvas.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // Score
        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.fillText(gameState.leftPaddle.score + " | " + gameState.rightPaddle.score, GAME_WIDTH / 2, 80);
        // Ball
        ctx.fillStyle = '#689B8A';
        ctx.beginPath();
        ctx.arc(gameState.ball.x, gameState.ball.y, BALL_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        // left paddle
        ctx.fillStyle = '#280A3E';
        ctx.fillRect(0, gameState.leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        //right paddle
        ctx.fillRect(GAME_WIDTH - PADDLE_WIDTH, gameState.rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
        if (gameState.status === 'ended') {
            ctx.font = "48px serif";
            ctx.textAlign = "center";
            ctx.strokeText(gameState.winner === playerRole.current ? "You Won": "You Lost", GAME_WIDTH / 2, GAME_HEIGHT / 2);
            return;
        }
        
    }, []);

    const gameLoop = ()=> {
        if (pressedKeys.current.has('ArrowUp')) {
            socket.emit('moveUp', playerRole.current);
        }
        else if (pressedKeys.current.has('ArrowDown')) {
            socket.emit('moveDown', playerRole.current);
        }
        animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    function handlePlayBtn() {
        if (isPlaying.current)
            return;
        // socket.connect();
        console.log("Play Now");
        socket.emit("play");
        isPlaying.current = true;
        if (!animationFrameId.current)
            animationFrameId.current = requestAnimationFrame(gameLoop);

        if (!playerRole.current || playerRole.current === 'player1') {
            const canvas: HTMLCanvasElement | null = refCanvas.current;
            if (!canvas)
                return;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            ctx.font = "48px serif";
            ctx.textAlign = "center";
            ctx.strokeText("Waiting for opponent..", GAME_WIDTH / 2, GAME_HEIGHT / 2);
        }
    }

    function handleStopBtn() {
        console.log("stop game");
        socket.emit('stopGame');
        isPlaying.current = false

    }

    function keydownEvent(event: KeyboardEvent) {
        event.preventDefault();
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
            pressedKeys.current.add(event.key);
    }

    function keyupEvent(event: KeyboardEvent) {
        event.preventDefault();
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown')
            pressedKeys.current.delete(event.key);
    }

    return {
        handlePlayBtn,
        handleStopBtn,
        refCanvas,
    };
};