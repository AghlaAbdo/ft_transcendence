"use client";

import Input from '@/components/auth/Input'
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';
import { Mail, Lock, User } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import * as z from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';


const schema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  email: z.string().email("Invalid email")
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
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




type FormData = z.infer<typeof schema>;
type ResetPasswordInput = z.infer<typeof changePasswordSchema>;


const SettingsPage = () => {
  const {user, isLoading} = useAuth();
  const [avatar, setAvatar] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatar(user.avatar_url);
    }
  }, [user?.avatar_url]);
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    formState: { errors: errorsInfo },
    reset: resetInfo
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    formState: { errors: errorsSecurity },
    reset: resetSecurity
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file  = e.target.files[0];
      // console.log("file : ", file);
      // 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setAvatar(URL.createObjectURL(file));

      const formData = new FormData();

      formData.append("avatar", file); // files comes from <input type="file">

      try {
        const response = await fetch("https://localhost:8080/api/users/upload-avatar", {
          method: "POST",
          // headers: {
          //   Authorization: `Bearer ${token}`
          // },
          body: formData,
          credentials: "include", // sends the token cookie automatically no Authorization header is required, the browser send token automatically
        });

        const data = await response.json();

        if (response.ok && data.status) {
          
          toast.success("Avatar uploaded successfully!");
        } else {
          toast.error("Failed to upload avatar");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload avatar. Please try again.");
      }

    }
  }
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleUpdateInfo = async (data: FormData) => {
    try {
      const response = await fetch('https://localhost:8080/api/users/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          username: data.username,
          email: data.email
        }),
        credentials: "include"  // allow cookies
      });

      const dataResponse = await response.json();
      if (response.ok) {
        toast.success(dataResponse.message);
        resetInfo();        
      } else {
        toast.error(dataResponse.message);
      }
    } catch (error) {
      toast.error(`❌ Network error. Please check your connection and try again.`);
    }
  }

  const handleChangePasswod = async (data: ResetPasswordInput) => {
    try {
      const response = await fetch('https://localhost:8080/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          currentPassword: data.currentPassword, 
          newPassword: data.newPassword 
        }),
        credentials: "include"  // allow cookies
      });

      const dataResponse = await response.json();
      if (response.ok && dataResponse.status) {
        toast.success(dataResponse.message);
        resetSecurity(); 
      } else {
        toast.error(dataResponse.message);
      }
    } catch (error) {
      toast.error(`❌ Network error. Please check your connection and try again.`);
    }
  }

  if (isLoading) 
    return <p className="text-gray-400">Loading profile...</p>;

  if (!user) 
    return <p className="text-gray-500">User not found</p>;
  console.log("user from settings: ", user);
  
  return (
        <div className="h-[calc(100vh_-_72px)] text-white flex px-2 gap-2 ">
          <div className="flex-1 rounded-[20px] flex flex-col my-2 gap max-w-6xl mx-auto bg-[#021024]">
            <div className='px-20 py-10'>
              <div className='flex-1'>
                <h2 className='text-4xl font-bold mb-2'>Settings</h2>
                <p className='text-gray-500 text-xl font-medium'>Manage your account settings</p>
              </div>

              <div className="flex-1 mt-10  rounded-3xl bg-[#0f172a] h-[400px] flex flex-col p-14 space-y-12 shadow-xl">
                  {/* Title */}
                  <div>
                    <h2 className="text-3xl font-bold text-white">Profile Picture</h2>
                    <p className="text-gray-400 text-xl font-medium mt-3">Update your avatar to personalize your profile</p>
                  </div>

                  <div className="flex flex-row items-center gap-20 -mt-5">
                    <div className="relative">
                      <div className="rounded-full border-6 border-purple-500 overflow-hidden shadow-2xl">
                        
                        {avatar && (
                            <img
                              src={avatar || "/avatars/avatar1.png"}
                              alt="avatar"
                              className="w-45 h-45 object-cover"
                              
                            />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <span
                        className={`absolute bottom-6 right-6 w-8 h-8 bg-green-500 border-8 border-[#0f172a] rounded-full ${
                            user.online_status === 0
                              ? "bg-yellow-500"   // offline
                              : user.online_status === 1
                              ? "bg-green-500"  // online
                              : "bg-orange-500"   // ingame
                          }`}
                        ></span>
                      {/* <span className="absolute bottom-6 right-6 w-8 h-8 bg-green-500 border-8 border-[#0f172a] rounded-full"></span> */}
                    </div>

                    <div className="flex flex-col items-start space-y-6 text-gray-300">
                      <p className="text-2xl">Choose a new profile picture</p>

                      <div className="flex flex-row gap-6 mx-auto">
                        <button 
                          onClick={handleUploadClick}
                          className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xl shadow-lg transition">
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
              </div>

              <div className='flex-1 mt-10  rounded-4xl bg-[#0f172a] h-200 px-14 py-10 flex flex-col gap-5'>
                <div>
                    <h2 className="text-3xl font-bold text-white">Profile Settings</h2>
                    <p className="text-gray-400 text-xl font-medium mt-3">Update your Info or Add an extra layer of security to your account</p>
                </div>
                <div className="flex-1  rounded-3xl bg-[#0f172a] p-10 shadow-xl">
                  {/* Tabs */}
                  <div className="flex space-x-6 border-b border-slate-700 mb-10">
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`px-6 py-3 text-lg font-semibold transition ${
                        activeTab === "info"
                          ? "text-purple-500 border-b-4 border-purple-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Info
                    </button>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`px-6 py-3 text-lg font-semibold transition ${
                        activeTab === "security"
                          ? "text-purple-500 border-b-4 border-purple-500"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Security
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex justify-center">
                    {activeTab === "info" && (
                      <form className="space-y-6 flex flex-col w-[600px]" onSubmit={handleSubmitInfo(handleUpdateInfo)}>
                        <h2 className='text-3xl font-bold'>Basic Information</h2>
                        <div>
                          <Input 
                            icon={User} 
                            type="text" 
                            placeholder="Username"
                            {...registerInfo("username")}
                          />
                          {errorsInfo.username && <p className="text-red-500">{errorsInfo.username.message}</p>}

                        </div>
                        <div>
                          <Input 
                            icon={Mail} 
                            type="email"
                            placeholder="Email" 
                            {...registerInfo("email")}
                          />
                          {errorsInfo.email && <p className="text-red-500">{errorsInfo.email.message}</p>}
                        </div>

                        <button
                          type="submit"
                          className="flex justify-center items-center border-2 border-slate-700 bg-purple-600
                            px-6 py-3 rounded-xl shadow-md gap-3
                            text-white font-semibold text-xl
                            hover:bg-purple-700 hover:shadow-purple-500/50
                            focus:outline-2 focus:outline-offset-2 focus:outline-purple-500
                            transition"
                        >
                          Save Changes
                        </button>
                      </form>
                    )}

                    {activeTab === "security" && (
                    <div className="space-y-10 flex flex-col w-[600px]">
                      <form className="space-y-6 flex flex-col w-[600px]" onSubmit={handleSubmitSecurity(handleChangePasswod)}>
                        <h2 className='text-3xl font-bold'>Security Settings</h2>
                        <div>
                          <Input 
                            icon={Lock} 
                            type="password" 
                            placeholder="Current Password"
                            {...registerSecurity("currentPassword")}
                          />
                          {errorsSecurity.currentPassword && (
                            <p className="text-red-500">{errorsSecurity.currentPassword.message}</p>
                          )}
                        </div>
                        <div>
                          <Input 
                            icon={Lock} 
                            type="password" 
                            placeholder="New Password"
                            {...registerSecurity("newPassword")}
                          />
                          {errorsSecurity.newPassword && (
                            <p className="text-red-500">{errorsSecurity.newPassword.message}</p>
                          )}
                        </div>
                        <div>
                          <Input 
                            icon={Lock} 
                            type="password" 
                            placeholder="Confirm Password"
                            {...registerSecurity("confirmPassword")}
                          />
                          {errorsSecurity.confirmPassword && (
                            <p className="text-red-500">{errorsSecurity.confirmPassword.message}</p>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="flex justify-center items-center border-2 border-slate-700 bg-purple-600
                            px-6 py-3 rounded-xl shadow-md gap-3
                            text-white font-semibold text-xl
                            hover:bg-purple-700 hover:shadow-purple-500/50
                            focus:outline-2 focus:outline-offset-2 focus:outline-purple-500
                            transition"
                        >
                          Update Password
                        </button>
                      </form>
                      <TwoFactorAuth/>
                    </div>
                      
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>  
  )
}

export default SettingsPage