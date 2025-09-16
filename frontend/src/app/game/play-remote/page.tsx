'use client';

import { GAME_HEIGHT, GAME_WIDTH } from '@/constants/game';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';
import Matching from '@/components/Matching';

import Styles from './game.module.css';

export default function GamePage() {
  const { handlePlayBtn, handleStopBtn, containerRef, waiting, opponent } = usePongGameLogic();
  return (
    <>
      {waiting ? <Matching opponent={opponent}/>: 

        <div className={Styles.container}>
          <div ref={containerRef}></div>
        </div>
      }
    </>
  );
}
