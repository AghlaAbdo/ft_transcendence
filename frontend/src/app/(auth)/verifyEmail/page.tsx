"use client";

import Input from '@/components/auth/Input';
import { KeyRound, Mail } from 'lucide-react';
import { log } from 'node:console';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [showResend, setShowResend] = useState<boolean>(false)
//   const [message, setMessage] = useState<string>("");

  const handleVerifyEmail = async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();
    setShowResend(true);
    try {
        const response = await fetch('https://localhost:8080/api/auth/verify-email', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: code }),
            credentials: "include"
        });

        if (response.ok) {
          console.log("------------------------------------- redirect/login----------");
          
            toast.success("✅ Your email has been verified. Please log in");
            window.location.href = '/login';
            setShowResend(false);
        } else {
            const data: { success?: boolean; message?: string; error?: string } = await response.json();

            console.log("sdfsdf", data.error);
            
            if (data.error && (data.error === 'TOKEN_EXPIRED')) {
              setShowResend(true);
              return ;
            }
            toast.error((data.message || "Verification failed"));
            setShowResend(false);
            // setMessage((data.message || "Verification failed"));
        }

    } catch (error: unknown) {
        setShowResend(false);
        toast.error('Network error. Please try again.');

        // if (error instanceof Error) {
            // setMessage(error.message);
        // } else {
            // setMessage("An unknown error occurred");
        // }
    }
  }

  const handleResend = async () => {
    try {
        const response = await fetch(`https://localhost:8080/api/auth/resend-verification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({email}),
          credentials: "include",
        });
    
        if (response.ok) {
          setShowResend(false);
          toast.success("📧 New verification email sent!");
        } else {
          const data = await response.json();
          toast.error("❌ " + data.message);
        }
    } catch (error: unknown) {
        toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-3xl font-bold text-center mb-5'>Verify your email</div>
        <form className='space-y-4' onSubmit={handleVerifyEmail}>
            
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}

            />
            <Input
                icon={KeyRound}
                type="text"
                placeholder="Enter your code"
                value={code}
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