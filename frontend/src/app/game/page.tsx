'use client'

import Styles from "./game.module.css"
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants/game';
import { usePongGameLogic } from '@/hooks/usePongGameLogic';

export default function GamePage() {
  const { handlePlayBtn, handleStopBtn, refCanvas} = usePongGameLogic();

  return (
    <>
      <button className={Styles.btn} onClick={handlePlayBtn}>Play Now</button>
      <button className={Styles.btn} onClick={handleStopBtn}>Stop Game</button>
      <div className={Styles.container}>
        <canvas ref={refCanvas} width={GAME_WIDTH} height={GAME_HEIGHT}className={Styles.canvas}></canvas>
      </div>
    </>
  );
}
