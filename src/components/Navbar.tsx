'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { LogOut } from 'lucide-react';
import DarkModeToggle from './DarkButton';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center py-4 px-6">
        <Link href="/" className="group">
          <div className="flex items-center gap-2 transition-all duration-300 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-900 font-extrabold text-lg group-hover:scale-110 transition-transform duration-300">E</span>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 group-hover:from-pink-100 group-hover:to-white transition-all duration-300">
            EchoSecrets
            </span>
          </div>
        </Link>

        {session ? (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-bold mr-3">
                {(user.username || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-lg font-medium text-indigo-100">
                {user.username || user.email}
              </span>
            </div>
            {/* <DarkModeToggle /> */}
            <Button 
              onClick={() => signOut()} 
              variant="ghost" 
              className="group bg-transparent hover:bg-indigo-800 hover:text-white text-indigo-100 transition-all duration-300 font-medium"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button 
              className="bg-white hover:bg-indigo-100 text-indigo-900 hover:text-indigo-950 border-none transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;