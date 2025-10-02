import { redirect } from 'next/navigation';

export default function AlreadyInGame() {
  function handleReturn() {
    redirect('/game');
  }

  return (
    <div className='h-[calc(100vh-100px)] flex justify-center items-center'>
      <div className='w-fit bg-dark-blue rounded-[8px] border-[1px] border-gray-700 pt-4 pb-2 px-6'>
        <div className='mb-6'>
          <p className='text-2xl text-gold text-center font-bold'>
            You are already in another game
          </p>
          <p className='text-[16px] text-gray-200 text-center '>
            continue playing in the previous session.
          </p>
        </div>
        <div className='flex justify-center'>
          <button
            onClick={handleReturn}
            className='w-full max-w-[88px] bg-red px-3 py-[2px] rounded-[8px] text-[18px] text-gray-50 font-bold cursor-pointer'
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
}
