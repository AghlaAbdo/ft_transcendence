import React from 'react';

import { redirect } from 'next/navigation';

import HomePage from './home/page';

const MainPage = () => {
  return redirect('/home');
  // return <HomePage />
}

export default MainPage;
