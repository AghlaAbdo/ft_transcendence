import { socket } from '../socket/manager.js';
import { playerData } from '../main.js';
import { setUpReadline } from './readlineHandler.js';

function handleKeypress(_str: string, key: any) {
  if (key.ctrl && key.name === 'c') {
    socket.emit('quit', {
      userId: playerData.user!.id,
      gameId: playerData.gameId,
    });
    socket.close();
    console.log('\nGoodbye 👋');
    process.exit();
  }
  if (key.name === 'up') {
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'up');
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'up');
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'up');
  } else if (key.name === 'down') {
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'down');
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'down');
    socket.emit('movePaddle', playerData.gameId, playerData.role, 'down');
  } else if (key.sequence === 'q') {
    console.log('Quitting game...');
    // console.log('playerData when quit 22: ', playerData);
    console.log('playerData.gameStatus: ', playerData.gameStatus);
    if (playerData.gameStatus === 'matching')
      socket.emit('cancelMatching', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    else
      socket.emit('quit', {
        userId: playerData.user!.id,
        gameId: playerData.gameId,
      });
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.off('keypress', handleKeypress);
    setUpReadline();
    playerData.inGame = false;
    playerData.gameStatus = null;
  }
}

export function setupKeypress() {
  process.stdin.on('keypress', handleKeypress);
}

export function clearKeypress() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdin.off('keypress', handleKeypress);
}
