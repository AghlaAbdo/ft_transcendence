import { redirect } from 'next/navigation'
import React from 'react'
import HomePage from './home/page'

const MainPage = () => {
  // return redirect('/home');
  return <HomePage />
}

export default MainPage