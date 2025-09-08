'use client';

import Link from 'next/link';
import Image from 'next/image';
import localGamePng from '@/../public/images/Local-Game.jpg'
import onlineGamePng from '@/../public/images/Online-Game.jpg'
import multiPlayerPng from '@/../public/images/Multiplayer-Game.jpg'
import tournamentPng from '@/../public/images/Tournament.jpg'
import Styles from './game.module.css'

export default function GamePage() {

  return (
    <div id={Styles.container}>
      <div>
        <h1>Game Modes</h1>
        <div>
          <div>
            <Image src={localGamePng} alt='Local Game' />
            <div>
              <div>
                <h3>Local Game</h3>
                <p>Play with your friend on your local computer.</p>
              </div>
              <Link href='#'>Play Now</Link>
            </div>
          </div>

          <div>
            <Image src={onlineGamePng} alt='Online Game' />
            <div>
              <div>
                <h3>Online Game</h3>
                <p>Play with a random person online.</p>
              </div>
              <Link href="/game/play-remote">Play Now</Link>
            </div>
          </div>

          <div>
            <Image src={multiPlayerPng} alt='Team Game' />
            <div>
              <div>
                <h3>Team Game</h3>
                <p>Team up with another player and play against two others.</p>
              </div>
              <Link href='#'>Play Now</Link>
            </div>
          </div>

          <div>
            <Image src={tournamentPng} alt='Tournament Game' />
            <div>
              <div>
                <h3>Tournament</h3>
                <p>Participate in a tournament and challenge your self to be the winner.</p>
              </div>
              <Link href='#'>Play Now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
