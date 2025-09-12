'use client';

import { GAME_HEIGHT, GAME_WIDTH } from '@/constants/game';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

import Styles from './game.module.css';

export default function GamePage() {
  const { handlePlayBtn, handleStopBtn, containerRef } = usePongGameLogic();

  return (
    <>
      <button className={Styles.btn} onClick={handlePlayBtn}>
        Play Now
      </button>
      <button className={Styles.btn} onClick={handleStopBtn}>
        Stop Game
      </button>
      <div className={Styles.container}>
        <div ref={containerRef}></div>
      </div>
    </>
  );
}
