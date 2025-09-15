'use client';

import { GAME_HEIGHT, GAME_WIDTH } from '@/constants/game';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';
import Matching from '../matching/page';

import Styles from './game.module.css';

export default function GamePage() {
  const { handlePlayBtn, handleStopBtn, containerRef, waiting } = usePongGameLogic();
  return (
    <>
      {waiting ? <Matching/>: 

        <div className={Styles.container}>
          <div ref={containerRef}></div>
        </div>
      }
    </>
  );
}
