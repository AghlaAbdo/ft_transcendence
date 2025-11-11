import { GAME_HEIGHT, GAME_WIDTH, TERM_HEIGHT, TERM_WIDTH } from '../config.js';
import { IGameState } from '../interfaces.js';
import { playerData } from '../main.js';

const scaleX = (x: number) => Math.floor((x / GAME_WIDTH) * TERM_WIDTH);
const scaleY = (y: number) => Math.floor((y / GAME_HEIGHT) * TERM_HEIGHT);

function transformX(x: number, playerRole: 'player1' | 'player2'): number {
  if (playerRole === 'player1') return x;
  return TERM_WIDTH - x;
}

export function renderGame(state: IGameState) {
  if (playerData.role === 'player1') {
    playerData.paddle = state.leftPaddle;
    playerData.opponentPaddle = state.rightPaddle;
  } else if (playerData.role === 'player2') {
    playerData.paddle = state.rightPaddle;
    playerData.opponentPaddle = state.leftPaddle;
  } else return;

  const ballX = transformX(scaleX(state.ball.x || 0), playerData.role);
  const ballY = scaleY(state.ball.y || 0);
  const p1Y = scaleY(playerData.paddle.y || 0);
  const p2Y = scaleY(playerData.opponentPaddle.y || 0);

  const paddleHeight = Math.max(
    3,
    Math.floor((150 / GAME_HEIGHT) * TERM_HEIGHT),
  );

  const p1PaddlePositions = Array(TERM_HEIGHT)
    .fill(false)
    .map((_, i) => i >= p1Y && i < p1Y + paddleHeight);
  const p2PaddlePositions = Array(TERM_HEIGHT)
    .fill(false)
    .map((_, i) => i >= p2Y && i < p2Y + paddleHeight);

  let display = `
Bing-Bong
Use arrows to move up and down
Press 'Q' to quit
  ${playerData.user?.username}: ${playerData.paddle.score}                               ${playerData.opponent?.username}: ${playerData.opponentPaddle.score}
----------------------------------------------------------------------------------
`;

  for (let y = 0; y < TERM_HEIGHT; y++) {
    let line = '|';
    for (let x = 0; x < TERM_WIDTH; x++) {
      if (x === ballX && y === ballY) {
        line += 'O';
      } else if (p1PaddlePositions[y] && (x === 0 || x === 1)) {
        line += '█';
      } else if (
        p2PaddlePositions[y] &&
        (x === TERM_WIDTH - 1 || x === TERM_WIDTH - 2)
      ) {
        line += '█';
      } else if (x === Math.floor(TERM_WIDTH / 2)) {
        line += '.';
      } else {
        line += ' ';
      }
    }
    line += '|';
    display += line + '\n';
  }

  display +=
    '----------------------------------------------------------------------------------\n';

  console.clear();
  console.log(display);
}
