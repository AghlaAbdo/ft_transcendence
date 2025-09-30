import React from 'react'

const ProfilePage = () => {
  return (
    <div className="h-[calc(100vh_-_72px)] bg-[#111827] text-white flex px-2 gap-2 ">
      <div className="flex-1 rounded-[20px] flex flex-col my-2 gap-2">
        <div className="flex-1 border-2 rounded-t-[20px] p-2 flex flex-col">
          <div className="relative w-full">
            <div className='flex-1'>
                <img src="./images/background.jpg" alt="background" className="w-full h-110" />
            </div>
            <div className='flex-1 justify-items-center'>
              {/* <div className='rounded-full border-4 border-gray-900'> */}
                <img 
                  src="./avatars/avatar3.png" 
                  alt="avatar"
                  className="absolute top-55 w-44 h-44 rounded-full z-2  " 
                />
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

        <div className="flex-1 border-2 rounded-b-[20px] p-2">
          Bottom section
        </div>
      </div>
    </div>    
  )
}

export default ProfilePage;
