"use client";

import Input from '@/components/auth/Input';
import { ChevronLeft, Mail } from 'lucide-react'
import Link from 'next/link';
import React, { FormEvent, useState } from 'react'
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState<string>("");

  const handleFrogotPassword = async (e: FormEvent<HTMLFormElement>) =>{
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:8080/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({email}),
          credentials: "include",
      });

      if (response.ok) {
        toast.success("📩 we’ve sent you a reset link.");
        setEmail("");
      } else {
        const data : { message?: string} = await response.json();
        toast.error(data.message || "❌ Failed to send reset email.");
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-3xl font-bold text-center mb-5'>Forgot your password?</div>

        <p className='text-slate-400 text-center -mt-3 mb-5'>Enter your email and we&apos;ll sent you a link to reset your password</p>
        <form className='space-y-4' onSubmit={handleFrogotPassword}>
            
            <Input
              icon={Mail}
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}

            />
            <button 
                type='submit'
                className='flex justify-center items-center border-2 border-slate-700
                p-2 rounded-lg hover:bg-blue-600 bg-blue-500 px-10 w-full' >
              <span className='font-medium'>Send Email</span>
            </button>

            <div className='flex justify-center items-center hover:text-sky-500'>
              <ChevronLeft />
              <Link href="/login" className=' hover:underline'>Back to Login</Link>
            </div>
        
        </form>

        {/* {message && <p className="mt-2 text-red-500">{message}</p>} */}
      </div>
    </div>
  )
}

export default ForgotPasswordPage