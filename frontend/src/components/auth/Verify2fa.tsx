import {useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';


interface disable2faprops {
  onclose: () => void;
  handledisable: () => void;
}

export default function Disable2fa({onclose,handledisable}: disable2faprops) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/auth/2fa/disable`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: code }),
        }
      );

      if (response.ok) {
        handledisable();
        onclose();
      } else {
        toast.error('Invalid code. Please try again.');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className='bg-slate-800 p-5 rounded-xl relative max-w-2xl'>
      <button
        onClick={onclose}
        className='absolute top-3 right-3 text-gray-400 hover:text-white '
      >
        <X size={20} />
      </button>
      <div className='flex gap-4 mb-4'>

       
      </div>

      <div className='mb-4'>
        <label className='mb-3 flex justify-center font-medium text-gray-300'>
          enter verification code
        </label>
        <input
          type='text'
          maxLength={6}
          value={code}
          onChange={(e) => {
            const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
            setCode(numbersOnly);
          }}
          placeholder='000000'
          className='w-full px-3 py-2.5 bg-gray-700 text-white text-center text-xl tracking-widest rounded-lg border border-gray-600 outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all'
        />
      </div>

      <div className='flex gap-2'>
        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || isVerifying}
          className='flex-1 px-3 py-2.5 bg-purple hover:bg-light-purple disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors'
        >
          {isVerifying ? 'Verifying...' : 'Verify & disable'}
        </button>
      </div>
    </div>
  );
}
