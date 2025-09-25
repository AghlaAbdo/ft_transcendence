import React from 'react'
import { Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import Input from '@/components/auth/Input'


const LoginPage = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-4xl font-bold text-center mb-5'>Login</div>
        <form className='space-y-4'>

            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
            />

            <h2 className='font-medium hover:text-sky-500'> 
              <Link href="/forgotPassword" className=' hover:underline'>Forgot Password?</Link>
            </h2>

            <button
                type="submit"
                className="flex justify-center items-center border-2 border-slate-700 bg-sky-700
                          p-2 rounded-lg shadow-md w-full gap-3
                          text-white font-medium
                          hover:bg-sky-600 hover:shadow-sky-500
                          focus:outline-2 focus:outline-offset-2 focus:outline-sky-500
                          transition-colors duration-200 ease-in-out"
              >
                Login
            </button>

            <p className='font-medium text-center'>
              Don't have an account? 
              <Link href="/signup" className='text-sky-500 hover:underline'> Sign Up</Link>
            </p>

            <div className='flex flex-row justify-around items-center pt-2'>
              <hr className="border-t-2 border-sky-500 w-1/3" />
              <span className='font-bold'>Or</span>
              <hr className="border-t-2 border-sky-500 w-1/3" />
            </div>

            
            <button 
                type='button'
                // onClick={handleGoogleLogin}
                className='flex justify-center items-center border-2 border-slate-700
                    p-2 rounded-lg shadow-md w-full gap-3 hover:shadow-sky-500
                    focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 bg-gray-700' >
              <img src="./icons/google.png" alt="google" className='size-5'/>
              <span className='font-medium'>Sign in with Google</span>
            </button>

        </form>
      </div>
    </div>
  )
}

export default LoginPage