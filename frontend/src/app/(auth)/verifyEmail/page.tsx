"use client";

import Input from '@/components/auth/Input';
import { KeyRound, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
//   const [message, setMessage] = useState<string>("");

  const handleVerifyEmail = async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();

    try {
        const response = await fetch('https://localhost:8080/api/auth/verify-email', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token: code }),
            credentials: "include"
        });

        if (response.ok) {
            toast.success("✅ Email verified! Redirecting...");
            // setMessage("✅ Email verified! Redirecting...");
            window.location.href = '/home';
        } else {
            const data: { success?: boolean; message?: string; error?: string } = await response.json();

            // if (data)
            console.log("--> ", data.error);
            toast.error((data.message || "Verification failed"));
            // setMessage((data.message || "Verification failed"));
        }

    } catch (error: unknown) {
        toast.error('Network error. Please try again.');
        // if (error instanceof Error) {
            // setMessage(error.message);
        // } else {
            // setMessage("An unknown error occurred");
        // }
    }
  }

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
            <button 
                type='submit'
                className='flex justify-center items-center border-2 border-slate-700
                    p-2 rounded-lg hover:bg-blue-600 bg-blue-500 px-10 w-full' >
              <span className='font-medium'>Verify</span>
            </button>
            </div>

        </form>

        {/* {message && <p className="mt-2 text-red-500">{message}</p>} */}
      </div>
    </div>
  )
}

export default VerifyEmailPage;