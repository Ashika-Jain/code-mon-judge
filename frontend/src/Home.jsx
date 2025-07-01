import React from 'react'
import HeaderLogin from './HeaderLogin';
import Intro_Website from './Intro_Website'
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <Navbar />
      <div>
        <HeaderLogin/>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Intro_Website/>
      </div>
    </div>
  )
}
