import readline from 'readline';
import chalk from 'chalk';
import { playerData } from '../main.js';
import { socket } from '../socket/manager.js';

let rl: readline.Interface | null = null;

const startMatch = () => {
  //   console.log('playerData: ', playerData);
  if (!playerData.user || !playerData.user.id) {
    console.log('userId is NULL');
    return;
  }
  socket.emit('requestMatchDetails', playerData.user.id);
  console.log('Searching for match...');
};

function readlineHandler(input: string) {
  if (!rl) return;
  const trimmed = input.trim().toLowerCase();
  //   console.log('trimmed: [',trimmed,']');

  if (trimmed === 'play' && !playerData.inGame) {
    startMatch();
  } else if (trimmed === 'play') {
    console.log(chalk.yellow('You already started a game!'));
  } else if (playerData.inGame && (trimmed === 'q' || trimmed === 'quit')) {
    console.log(chalk.yellow('Quit Game!'));
    // console.log('playerData when quit: ', playerData);
    if (playerData.inGame && playerData.gameStatus === 'matching')
      socket.emit('cancelMatching', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    else if (playerData.inGame)
      socket.emit('quit', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    playerData.inGame = false;
    playerData.gameStatus = null;
  } else if (trimmed === 'q' || trimmed === 'quit') {
    console.log(chalk.yellow('No active game to quit!'));
  } else if (trimmed === 'exit') {
    console.log('Exiting...');
    if (playerData.inGame && playerData.gameStatus === 'matching')
      socket.emit('cancelMatching', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    else if (playerData.inGame)
      socket.emit('quit', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    socket.close();
    process.exit(0);
  } else {
    console.log(
      chalk.yellow('Unknown command. Type "play" to start or "exit" to quit.'),
    );
  }
}

export function setUpReadline() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('line', readlineHandler);
  return rl;
}

export function clearReadline() {
  if (!rl) return;
  rl.off('line', readlineHandler);
  rl.close();
}
