"use client";

import React, { FormEvent, useState } from 'react'
import Input from '../../../components/auth/Input'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link';
import { toast } from "sonner";
import { redirect, useRouter } from 'next/navigation';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

import * as z from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  username: z.string().min(8, "Username must be at least 8 characters"),
  email: z.string().email("Invalid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
});


type FormData = z.infer<typeof schema>;

const SignUpPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
    });

  
    const handleSignUp = async (data: FormData) => {
      setMessage('');
  
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        const dataResponse: {status: boolean, message: string} = await response.json();

        if (response.ok && dataResponse.status) {
          if (dataResponse.message === 'VERIFICATION_EMAIL')
            toast.success("Please verify your email address. We've sent you a new verification email");
          else
            toast.success("Signup successful, Please verify your email address. We've sent you a new verification email");

          router.push(`/verifyEmail?email=${encodeURIComponent(data.email)}`);
          
        } else {
          toast.error(`${dataResponse.message}`);
          setMessage(dataResponse.message || 'Signup failed.');
        }
      } catch (error) {
        toast.error(`Network error. Please check your connection and try again.`);
        setMessage('Network error. Please check your connection and try again.');
      } 

    }

  const { handleGoogleLogin } = useGoogleAuth();

  return (
    <div className='flex justify-center items-center min-h-screen'>
    <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
      <div className='text-4xl font-bold text-center mb-5'>Sign Up</div>

      <form className='space-y-4' onSubmit={handleSubmit(handleSignUp)}>
        <div>
          <Input
            icon={User}
            type="text"
            placeholder="Username"
            // value={username}
            // onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            {...register("username")}
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>
        
        <div>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email"
            // value={email}
            // onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            {...register("email")}
            
            />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            // value={password}
            // onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            {...register("password")}
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>


          <button
              type="submit"
              className="flex justify-center items-center border-2 border-slate-700 bg-sky-700
                        p-2 rounded-lg shadow-md w-full gap-3
                        text-white font-medium
                        hover:bg-sky-600 hover:shadow-sky-500
                        focus:outline-2 focus:outline-offset-2 focus:outline-sky-500
                        transition-colors duration-200 ease-in-out"
            >
              Sign Up
          </button>

          <p className='font-medium text-center'>
              Already have an account? 
              <Link href="/login" className='text-sky-500 hover:underline'> Login</Link>
          </p>
          
          <div className='flex flex-row justify-around items-center pt-2'>
            <hr className="border-t-2 border-sky-500 w-1/3" />
            <span className='font-bold'>Or</span>
            <hr className="border-t-2 border-sky-500 w-1/3" />
          </div>

          
          <button 
              type='button'
              onClick={handleGoogleLogin}
              className='flex justify-center items-center border-2 border-slate-700
                  p-2 rounded-lg shadow-md w-full gap-3 hover:shadow-sky-500
                  focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 bg-gray-700' >
            <img src="./icons/google.png" alt="google" className='size-5'/>
            <span className='font-medium'>Sign in with Google</span>
          </button>

      </form>
      {
        message && (
          <p className={`text-center mt-4 ${
            message.includes('successful') ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </p>)
      }
    </div>
  </div>
  )
}

export default SignUpPage