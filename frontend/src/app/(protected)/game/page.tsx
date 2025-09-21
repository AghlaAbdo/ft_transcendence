'use client';

import Image from 'next/image';
import Link from 'next/link';

import localGamePng from '@/../public/images/Local-Game.jpg';
import multiPlayerPng from '@/../public/images/Multiplayer-Game.jpg';
import onlineGamePng from '@/../public/images/Online-Game.jpg';
import tournamentPng from '@/../public/images/Tournament.jpg';

import Styles from './game.module.css';

export default function GamePage() {
  return (
    <div id={Styles.container} className='flex justify-center'>
      <div className='w-full max-w-[1000px] m-3 md:m-6'>
        <h1 className='text-center text-2xl md:text-4xl font-bold text-gray-50 mb-8'>
          Game Modes
        </h1>
        <div className='grid  md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] gap-4 md:gap-12 justify-items-center'>
          <div className='flex items-center gap-3 md:gap-6 w-full bg-gray-800 rounded-2xl overflow-hidden max-w-[470px]'>
            <Image
              src={localGamePng}
              alt='Local Game'
              className=' max-w-[40%] h-[100%]'
            />
            <div className='flex flex-col justify-between h-full w-[60%] py-3 pr-3 md:pt-7 md:pr-4 md:pb-4'>
              <div>
                <h3 className='text-xl text-gray-50 font-bold pb-2 md:text-2xl md:pb-3'>
                  Local Game
                </h3>
                <p className='text-[15px] text-gray-200 md:text-[18px]'>
                  Play with your friend on your local computer.
                </p>
              </div>
              <Link
                href='#'
                className='bg-purple w-fit py-2 px-4 rounded-[8px] self-end font-bold'
              >
                Play Now
              </Link>
            </div>
          </div>

          <div className='flex items-center gap-3 md:gap-6 w-full bg-gray-800 rounded-2xl overflow-hidden max-w-[470px] '>
            <Image
              src={onlineGamePng}
              alt='Online Game'
              className=' max-w-[40%] h-[100%]'
            />
            <div className='flex flex-col justify-between h-full w-[60%] py-3 pr-3 md:pt-7 md:pr-4 md:pb-4'>
              <div>
                <h3 className='text-xl text-gray-50 font-bold pb-2 md:text-2xl md:pb-3'>
                  Online Game
                </h3>
                <p className='text-[15px] text-gray-200 md:text-[18px]'>
                  Play with a random person online.
                </p>
              </div>
              <Link
                href='/game/play-remote'
                className='bg-purple w-fit py-2 px-4 rounded-[8px] self-end font-bold'
              >
                Play Now
              </Link>
            </div>
          </div>

          <div className='flex items-center gap-3 md:gap-6 w-full bg-gray-800 rounded-2xl overflow-hidden max-w-[470px]'>
            <Image
              src={multiPlayerPng}
              alt='Team Game'
              className=' max-w-[40%] h-[100%]'
            />
            <div className='flex flex-col justify-between h-full w-[60%] py-3 pr-3 md:pt-7 md:pr-4 md:pb-4'>
              <div>
                <h3 className='text-xl text-gray-50 font-bold pb-2 md:text-2xl md:pb-3'>
                  Team Game
                </h3>
                <p className='text-[15px] text-gray-200 md:text-[18px]'>
                  Team up with another player and play against two others.
                </p>
              </div>
              <Link
                href='#'
                className='bg-purple w-fit py-2 px-4 rounded-[8px] self-end font-bold'
              >
                Play Now
              </Link>
            </div>
          </div>

          <div className='flex items-center gap-3 md:gap-6 w-full bg-gray-800 rounded-2xl overflow-hidden max-w-[470px]'>
            <Image
              src={tournamentPng}
              alt='Tournament Game'
              className=' max-w-[40%] h-[100%]'
            />
            <div className='flex flex-col justify-between h-full w-[60%] py-3 pr-3 md:pt-7 md:pr-4 md:pb-4'>
              <div>
                <h3 className='text-xl text-gray-50 font-bold pb-2 md:text-2xl md:pb-3'>
                  Tournament
                </h3>
                <p className='text-[15px] text-gray-200 md:text-[18px]'>
                  Participate in a tournament and challenge your self to be the
                  winner.
                </p>
              </div>
              <Link
                href='#'
                className='bg-purple w-fit py-2 px-4 rounded-[8px] self-end font-bold'
              >
                Play Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
