"use client";

import { useAuth } from '@/hooks/useAuth'
import React from 'react'

const HomePage = () => {

  const { user, isLoading } = useAuth();

  // if (isLoading) {
  //   return <div className="">Loading...</div>
  // }
  
  return (
    <div>
      <h1> Welcome {user?.username}</h1>
      HomePage
    </div>
  )
}

export default HomePage