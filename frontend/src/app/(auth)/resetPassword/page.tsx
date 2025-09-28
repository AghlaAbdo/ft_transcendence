"use client";

import Input from '@/components/auth/Input';
import { Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner';


import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});



type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;


const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const router = useRouter();
  
  useEffect(() => {
    const t = searchParams.get("token");
    if (t) {
        setToken(t);
        router.push('/resetPassword');
    }
  }, [router]);

  const handleResetPassword = async (data: ResetPasswordInput) =>{
    // e.preventDefault();
    
    // if (password !== confirm) {
    //     toast.error("❌ Passwords do not match");
    //     return;
    // }

    // if (!token) {
    //     toast.error("❌ Missing token.");
    //     return;
    // }

    try {
      const response = await fetch("https://localhost:8080/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: data.newPassword }),
          credentials: "include",
      });

      if (response.ok) {
        toast.success("✅ Password reset successful! Please log in.");
        window.location.href = "/login";
      } else {
        const data : { error?: string} = await response.json();
        toast.error(data.error || "❌ Failed to send reset email.");
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <div className='text-3xl font-bold text-center mb-5'>Reset Your Password</div>

        <form className='space-y-4' onSubmit={handleSubmit(handleResetPassword)}>         
            <Input
              icon={Lock}
              type="password"
              placeholder="New password"
              {...register("newPassword")}
            //   value={password}
            //   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
            )}
            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword")}
            //   value={confirm}
            //   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            />
            {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
            )}
            {/* {confirm && confirm !== password && (
                <p className="text-red-500 text-sm mt-1">
                    ❌ Passwords do not match
                </p>)
            } */}
            <button 
                type='submit'
                className='flex justify-center items-center border-2 border-slate-700
                p-2 rounded-lg hover:bg-blue-600 bg-blue-500 px-10 w-full' >
              <span className='font-medium'>Reset Password</span>
            </button>
        </form>

        {/* {message && <p className="mt-2 text-red-500">{message}</p>} */}
      </div>
    </div>
    )
}

export default ResetPasswordPage