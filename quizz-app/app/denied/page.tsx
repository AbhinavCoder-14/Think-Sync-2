// app/access-denied/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';



export default function AccessDenied() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {/* A simple emoji for visual feedback */}
      <span className="text-6xl mb-4" role="img" aria-label="Stop">
        🚫
      </span>
      
      <h1 className="text-3xl font-bold mb-2">
        Access Denied
      </h1>
      
      <p className="text-lg mb-6 max-w-md">
        You do not have the necessary permissions to view this page.
        This content is restricted to administrators.
      </p>
      
      {session && (
        <p className="text-md mb-6 max-w-md">
          You are currently signed in as: <strong>{session.user?.name || session.user?.email}</strong>
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => router.push('/')}
          className="m-3 p-2 border-blue-900 border-2 cursor-pointer rounded-xl bg-blue-700 text-white hover:bg-blue-800"
        >
          Go to Home Page
        </button>

        <button 
          onClick={() => signOut({ callbackUrl: '/' })} // Signs out and redirects to home
          className="m-3 p-2 border-gray-500 border-2 cursor-pointer rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Sign Out & Try Another Account
        </button>
      </div>
    </div>
  );
}