import { Socket } from 'socket.io-client';
import chalk from 'chalk';
import readline from 'readline';
import { playerData } from '../main.js';
import { IGameState, IPlayer } from '../interfaces.js';
import { clearReadline, setUpReadline } from '../cli/readlineHandler.js';
import { clearKeypress, setupKeypress } from '../cli/keypressHandler.js';
import { renderGame } from '../game/render.js';

export function handleConnect(socket: Socket) {
  if (playerData.user?.id) socket.emit('hello', playerData.user.id);
  console.log(chalk.yellowBright('Type "play" to start or "exit" to quit.'))
}

export function handlePlayerData(data: {
  playerRole: 'player1' | 'player2';
  gameId: string;
  player: IPlayer;
}) {
  playerData.gameId = data.gameId;
  playerData.role = data.playerRole;
  playerData.user = data.player;
}

export function handleMatchFound(socket: Socket, opponent: IPlayer) {
  console.clear();
  console.log('Matched! Opponent:', opponent.username);
  playerData.gameStatus = 'playing';
  playerData.opponent = opponent;
  readline.emitKeypressEvents(process.stdin);
  clearReadline();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }
  setupKeypress();
}

export function handleGameStateUpdate(socket: Socket, state: IGameState) {
  if (state.status === 'ended') {
    //   if (renderInterval) clearInterval(renderInterval);
    socket.emit('quit', {
      userId: playerData.user!.id,
      gameId: playerData.gameId,
      opponentId: playerData.opponent!.id,
    });
    console.log(chalk.bold('\n🏁 Game Over!'));
    console.log(
      `Final Score: ${state.leftPaddle.score} - ${state.rightPaddle.score}`,
    );
    const winner =
      state.winner === playerData.role
        ? playerData.user?.username
        : playerData.opponent?.username;
    if (winner) console.log(chalk.green(`Winner: ${chalk.bold(winner)}`));
    else console.log(chalk.yellow('No winner (maybe opponent quit).'));
    process.stdin.setRawMode(false);
    playerData.inGame = false;
    playerData.gameStatus = null;
    clearKeypress();
    setUpReadline();
    console.log(chalk.yellowBright('Type "play" to start or "exit" to quit.'));

    // process.stdin.pause();
    return;
  }
  renderGame(state);
}

export function handleMatchDetails(
  socket: Socket,
  data: { gameStatus: string },
) {
  if (data.gameStatus === 'notFound') {
    playerData.inGame = true;
    playerData.gameStatus = 'matching';
    socket.emit('play', playerData.user!.id);
    console.log(chalk.yellowBright("type 'Q' to cancel matching"));
  } else {
    console.log(chalk.red('You are already playing in another session !'));
  }
}
