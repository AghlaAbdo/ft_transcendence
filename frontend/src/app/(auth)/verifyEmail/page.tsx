"use client";

import Input from '@/components/auth/Input';
import { set } from 'date-fns';
import { KeyRound, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState<string>("");
  const [showResend, setShowResend] = useState<boolean>(false);
  const isValidCode = /^\d{6}$/.test(code);
  
  const handleVerifyEmail = async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();

    if (!email) {
      toast.error('Email is missing. Please try signing up again.');
      return;
    }

    if (!isValidCode) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
        const response = await fetch('https://localhost:8080/api/auth/verify-email', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: code }),
            credentials: 'include',
        });

        if (response.ok) {
            toast.success("✅ Your email has been verified.");
            router.push("/home");
        } else {
            const data: { success?: boolean; message?: string; error?: string } = await response.json();

            if (data.error && (data.error === 'TOKEN_EXPIRED')) {
              toast.error(data.message);
              setCode("");
              setShowResend(true);
              return ;
            }
            toast.error((data.message || "Verification failed"));
        }

    } catch (error: unknown) {
        setShowResend(false);
        toast.error('Network error. Please try again.');
    }
  }

  const handleResend = async () => {

    if (!email) {
      toast.error('Email is missing. Please try signing up again.');
      return;
    }

    setCode("");
    
    try {
        const response = await fetch(`https://localhost:8080/api/auth/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({email}),
          credentials: "include",
        });
    
        const data = await response.json();
        if (response.ok && data.status) {
          setShowResend(false);
          toast.success("📧 New verification email sent!");
        } else {
          toast.error("❌ " + data.message);
        }
    } catch (error: unknown) {
        toast.error('Network error. Please try again.');
    }
  };

  if (!email) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
          <div className='text-xl text-center text-red-400 mb-4'>
            ⚠️ Email address is missing
          </div>
          <p className='text-center text-slate-300 mb-4'>
            Please go back and sign up again.
          </p>
          <button 
            onClick={() => router.push('/signup')}
            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg'
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-3xl font-bold text-center mb-5'>Verify your email</div>

        <form className='space-y-4' onSubmit={handleVerifyEmail}>
            
            <Input
                icon={KeyRound}
                type="text"
                placeholder="Enter your code"
                value={code}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            />

            <div className='flex justify-center items-center'>
            {/* {hidden && <p>{hidden}</p>} */}
            {showResend ?
              (<button 
                  type='button'
                  onClick={handleResend}
                  className='flex justify-center items-center border-2 border-slate-700
                      p-2 rounded-lg hover:bg-blue-600 bg-blue-500 px-10 w-full' >
                <span className='font-medium'>Resend verification email</span>
              </button>)
            : 
              (<button 
                type='submit'
                className='flex justify-center items-center border-2 border-slate-700
                    p-2 rounded-lg hover:bg-blue-600 bg-blue-500 px-10 w-full' >
              <span className='font-medium'>Verify</span>
              </button>)
            }
            </div>

        </form>

        {/* {message && <p className="mt-2 text-red-500">{message}</p>} */}
      </div>
    </div>
  )
}

export default VerifyEmailPage