"use client";

import Friends from '@/components/profile/Friends';
import { GameHistory } from '@/components/profile/GameHistory';
import UserCard from '@/components/profile/UserCard';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { User } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getFrameByLevel } from '@/utils/getFrameByLevel';

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

  useEffect( () => {
    const fetchUserById = async () => {
      try {
        if (!id) 
          return; 
        const response = await fetch(`https://localhost:8080/api/users/profile/${id}`, {
          credentials: "include"
        });
        const data: {status: string, user: User, message: string} = await response.json();

        if (response.ok && data.status) {
          setUser(data.user);
        } else {
          throw new Error(data.message || "Failed to load user");
        }
        } catch (erro) {
          setError(getErrorMessage(error));
        } finally {
        setLoading(false);
      }
    };
    fetchUserById();
  }, [id]);

  if (loading) 
    return <p className="text-gray-400">Loading profile...</p>;
  
  if (error)
    return <p className="text-red-500">{error}</p>;

  if (!user) 
    return <p className="text-gray-500">User not found</p>;
  
  return (
    <div className="h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2 ">
      <div className="flex-1 rounded-[20px] flex flex-col mt-10 my-2 gap-2 max-w-7xl mx-auto">
          <div className="rounded-t-[20px] p-2 flex flex-col">
            <div className="relative w-full">
              <div className='flex-1 px-4'>
                  <img src="/images/background.jpg" alt="background" className="w-full h-110 rounded-3xl" />
              </div>
              <div className='flex-1 justify-items-center flex justify-center'>
          
                  {/* <img 
                    src={user.avatar_url || "/avatars/avatar1.png"} 
                    alt="avatar"
                    className="absolute top-55 w-44 h-44 rounded-full z-2  " 
                    /> */}

                  <div className={`absolute top-55 z-9`}>
                    <img
                      src={user.avatar_url  || "/avatars/avatar1.png"}
                      alt='Avatar'
                      className='w-45 h-45 rounded-full p-[12%]'
                    />
                    <img
                      src={getFrameByLevel(user.level)}
                      alt='Frame'
                      className='absolute w-45 h-45 inset-0 pointer-events-none'
                    />
                    <span
                      className={`absolute bottom-6 right-6 w-8 h-8 bg-green-500 border-8 border-[#0f172a] rounded-full ${
                          user.online_status === 0
                            ? "bg-yellow-500"   // offline
                            : user.online_status === 1
                            ? "bg-green-500"  // online
                            : "bg-orange-500"   // ingame
                        }`}
                      ></span>
                  </div>

              </div>

              <div className='flex-1'>

                <div className="absolute left-1/2 top-75 transform -translate-x-1/2 z-1 w-full">

                  <div className="h-30 bg-slate-800/40 backdrop-blur-xl/
                      rounded-3xl shadow-2xl border border-slate-700 relative mt-5 z-0">

                      <div className="grid grid-cols-3 items-center">

                        <div className="ml-10 grid grid-cols-3 mt-8 mx-auto gap-10 text-center text-lg md:text-xl">
                          <div>
                            <p className="text-gray-400">Total Game</p>
                            <p className="font-bold">{ user.wins + user.losses }</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Wins</p>
                            <p className="font-bold">{user.wins}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Loss</p>
                            <p className="font-bold">{user.losses}</p>
                          </div>
                        </div>

                        <div className="text-lg md:text-xl">
                          <h2 className="text-center mt-15 font-semibold">{user.username}</h2>
                        </div>

                        <div className="mr-10 mx-auto grid grid-cols-2 mt-8 gap-15 text-center text-lg md:text-xl">
                          <div>
                            <p className="text-gray-400">Location</p>
                            <p className="font-bold">🇲🇦 MAR</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Level</p>
                            <p className="font-bold">{user.level}</p>
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
                      <img src="/icons/gameHistory.png" alt="" width={35} height={35}/>
                      <span className='text-2xl font-bold'>Match History</span>
                    </div>
                  </div>
                </div>
                 <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 rounded-xl">
                  <GameHistory 
                    id = {user.id}
                  />
                </div>
              </div>
            </div>

            <div className='w-full'>
              <div className='relative bg-[#021024] rounded-3xl p-8 mb-6 overflow-hidden border border-slate-800 flex-1'>
                <div className='border-b border-slate-800'>
                  <div className='flex'>
                    <div className='px-8 py-4 text-lg font-bold -mt-2 hover:border-b-4  border-purple-600 flex gap-2 items-center'>
                      <img src="/icons/friends.png" alt="" width={45} height={45}/>
                      <span className='text-2xl font-bold'>Friends</span>
                    </div>
                  </div>
                </div>
                 <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 rounded-xl">
                  <Friends 
                    id={user.id}
                  />
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
