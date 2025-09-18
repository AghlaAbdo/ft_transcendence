'use client';

import Matching from '@/components/Matching';

import { usePongGameLogic } from '@/hooks/usePongGameLogic';

import Styles from './game.module.css';

export default function GamePage() {
  const { containerRef, waiting, opponent } = usePongGameLogic();
  return (
    <>
      {waiting ? (
        <Matching opponent={opponent} />
      ) : (
        <div className={Styles.container}>
          <div ref={containerRef}></div>
        </div>
      )}
    </>
  );
}
