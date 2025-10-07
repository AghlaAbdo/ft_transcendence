import FriendRequestCard from '@/components/profile/FriendRequestCard';
import Friends from '@/components/profile/Friends';
import { GameHistory1 } from '@/components/profile/GameHistory';
import UserCard from '@/components/profile/UserCard';
import React from 'react';

const ProfilePage = () => {

  return (
    <div className="h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2 ">
      <div className="flex-1 rounded-[20px] flex flex-col mt-10 my-2 gap-2 max-w-7xl mx-auto">
          <div className="rounded-t-[20px] p-2 flex flex-col">
            <div className="relative w-full">
              <div className='flex-1 px-4'>
                  <img src="./images/background.jpg" alt="background" className="w-full h-110 rounded-3xl" />
              </div>
              <div className='flex-1 justify-items-center flex justify-center'>
          
                  <img 
                    src="./avatars/avatar3.png" 
                    alt="avatar"
                    className="absolute top-55 w-44 h-44 rounded-full z-2  " 
                    />
                  <span className='absolute -mt-20 ml-29 w-5 h-5 rounded-full  bg-green-500'></span>

              </div>

              <div className='flex-1'>

                <div className="absolute left-1/2 top-75 transform -translate-x-1/2 z-1 w-full">

                  <div className="h-30 bg-slate-800/40 backdrop-blur-xl/
                      rounded-3xl shadow-2xl border border-slate-700 relative mt-5 z-0">

                      <div className="grid grid-cols-3 items-center">

                        <div className="ml-10 grid grid-cols-3 mt-8 mx-auto gap-10 text-center text-lg md:text-xl">
                          <div>
                            <p className="text-gray-400">Total Game</p>
                            <p className="font-bold">156</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Win</p>
                            <p className="font-bold">85</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Loss</p>
                            <p className="font-bold">25</p>
                          </div>
                        </div>

                        <div className="text-lg md:text-xl">
                          <h2 className="text-center mt-15 font-semibold">username1</h2>
                        </div>

                        <div className="mr-10 mx-auto grid grid-cols-2 mt-8 gap-15 text-center text-lg md:text-xl">
                          <div>
                            <p className="text-gray-400">Location</p>
                            <p className="font-bold">🇲🇦 MAR</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Rank</p>
                            <p className="font-bold">15</p>
                          </div>
                        </div>

                      </div>

                  
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="rounded-b-[20px] p-2 flex flex-col md:flex-row gap-4">
            {/* Bottom section */}

            <div className='w-full'>
              <div className='relative bg-[#021024] rounded-3xl p-8 mb-6 overflow-hidden border border-slate-800 flex-1'>
                <div className='border-b border-slate-800'>
                  <div className='flex'>
                    <div className='px-8 py-4 text-lg font-bold  hover:border-b-4 border-purple-600 flex gap-2 items-center'>
                      <img src="./icons/gameHistory.png" alt="" width={35} height={35}/>
                      <span className='text-2xl font-bold'>Match History</span>
                    </div>
                  </div>
                </div>
                 <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 rounded-xl">
                  <GameHistory1 />
                </div>
              </div>
            </div>

            <div className='w-full'>
              <div className='relative bg-[#021024] rounded-3xl p-8 mb-6 overflow-hidden border border-slate-800 flex-1'>
                <div className='border-b border-slate-800'>
                  <div className='flex'>
                    <div className='px-8 py-4 text-lg font-bold -mt-2 hover:border-b-4  border-purple-600 flex gap-2 items-center'>
                      <img src="./icons/friends.png" alt="" width={45} height={45}/>
                      <span className='text-2xl font-bold'>Friends</span>
                    </div>
                  </div>
                </div>
                 <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 rounded-xl">
                  {/* <GameHistory1 /> */}
                  <Friends />
                </div>
              </div>
            </div>

          </div>

          {/* <div className='relative bg-[#021024] rounded-3xl -mt-7 p-8 overflow-hidden border border-slate-800 flex-1  gap-2'>
            <div className=' flex flex-col gap-2'>
              <p className='text-2xl font-bold text-center'>send request</p>
              <UserCard 
                id={4}
                username='aben-cha1'
                avatar_url="/uploads/avatars/4-avatar4.png"
              />
              <p></p>
              <UserCard 
                id={5}
                username='aben-cha2'
                avatar_url="/uploads/avatars/5-avatar3.png"
              />
            </div>
            <div className='flex flex-col gap-2'>
              <p className='text-2xl font-bold text-center'>All Pending Requests</p>

              <FriendRequestCard
                id={4}
                username='aben-cha1'
                avatar_url="/uploads/avatars/4-avatar4.png"
              />
            </div>
          </div> */}
      </div>
    </div>    
  )
}

export default ProfilePage;
