'use client';

import { usePongGameLogic } from '@/hooks/usePongGameLogic';

import { GAME_HEIGHT, GAME_WIDTH } from '../../constants/game';
import Styles from './game.module.css';

export default function GamePage() {
  const { handlePlayBtn, handleStopBtn, refCanvas } = usePongGameLogic();

  return (
    <>
      <button className={Styles.btn} onClick={handlePlayBtn}>
        Play Now
      </button>
      <button className={Styles.btn} onClick={handleStopBtn}>
        Stop Game
      </button>
      <div className={Styles.container}>
        <canvas
          ref={refCanvas}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className={Styles.canvas}
        ></canvas>
      </div>
    </>
  );
}
