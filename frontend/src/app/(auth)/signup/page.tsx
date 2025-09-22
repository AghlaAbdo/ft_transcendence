"use client";

import React, { useState } from 'react'
import Input from '../../../components/auth/Input'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link';
import { toast } from "sonner";
import { redirect } from 'next/navigation';


// function SignupForm() {
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");

//   const validateEmail = (value) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!regex.test(value)) setError("Invalid email");
//     else setError("");
//   };

//   return (
//     <div>
//       <input
//         type="email"
//         value={email}
//         onChange={(e) => {
//           setEmail(e.target.value);
//           validateEmail(e.target.value);
//         }}
//         placeholder="Email"
//       />
//       {error && <span style={{ color: "red" }}>{error}</span>}
//     </div>
//   );
// }

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  console.log(username, email, password);
  
    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      // setIsLoading(true);
      setMessage('');
  
      try {
        // Changed from 'http://localhost:5000/api/auth/signup' to relative path
        const response = await fetch('http://localhost:8080/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
          credentials: "include"  // allow cookies
        });
  
        const data = await response.json();
        console.log("data --> ", data.status, data.message);
        
        if (response.ok) {
          toast.success("✅ Logged in successfully!");

          setMessage('Signup successful!');

        } else {
          toast.error(`❌ ${data.message}`);
          setMessage(data.error || 'Signup failed.');
        }
      } catch (error) {
        toast.error(`❌ Network error. Please check your connection and try again.`);
        setMessage('Network error. Please check your connection and try again.');
      } 
      // finally {
        // setIsLoading(false);
      // }
    }

    const handleGoogleLogin = async (e: React.FormEvent) => {
      window.location.href = 'http://localhost:8080/api/auth/google';
    }

  return (
    <div className='flex justify-center items-center min-h-screen'>
    <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
      <div className='text-4xl font-bold text-center mb-5'>Sign Up</div>

      <form className='space-y-4' onSubmit={handleSignUp}>

          <Input
            icon={User}
            type="text"
            placeholder="Username"
            value={username}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          
          <Input
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />


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
      {/* {message && <p className="text-center text-white mt-4">{message}</p>} */}
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