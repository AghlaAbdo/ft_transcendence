"use client";
import { log } from 'console';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

const Verify2faPage = () => {
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const searchParams = useSearchParams();
    const tmpToken = searchParams.get('tmpToken');
    const router = useRouter();
    
    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        setIsVerifying(true);

        try {
        const response = await fetch(
            'https://localhost:8080/api/auth/2fa/verify-token',
            {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: code, tmpToken: tmpToken }),
            }
        );
        const data: {error: string} = await response.json();
        if (response.ok) {
            router.push('/success');
            return ;
        } else {
            console.log(data.error);
            toast.error('Invalid code. Please try again.');
        }
        } catch (error) {
        toast.error('Verification failed. Please try again.');
        } finally {
        setIsVerifying(false);
        }
    };
return (
    <div className='flex justify-center items-center min-h-screen'>
     <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-xl text-center text-red-400 mb-4 flex flex-col gap-4'>


            <div className=''>
                <label className='mb-3 flex justify-center text-2xl font-bold text-gray-300'>
                Enter verification code
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
                {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Verify2faPage