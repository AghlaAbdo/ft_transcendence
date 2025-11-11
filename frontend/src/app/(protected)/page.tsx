import React from 'react';

import { redirect } from 'next/navigation';

import HomePage from './home/page';

const MainPage = () => {
  return redirect('/home');

}

export default MainPage;
