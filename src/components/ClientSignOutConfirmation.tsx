'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import userLogOut from '@/libs/userLogOut';
import carProviderLogOut from '@/libs/carproviderLogOut';
import Link from 'next/link';

interface ClientSignOutConfirmationProps {
  callbackUrl: string;
}

export default function ClientSignOutConfirmation({ callbackUrl }: ClientSignOutConfirmationProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (session?.user?.token) {
        // Choose logout method based on user type
        let result;
        if (session.user.userType === 'provider') {
          result = await carProviderLogOut(session.user.token);
        } else {
          result = await userLogOut(session.user.token);
        }
        
        if (!result.success) {
          throw new Error('Failed to sign out properly');
        }
      }
      
      // Force sign out through NextAuth
      await signOut({ redirect: false });
      
      // Redirect to the callback URL after successful logout
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error('Error during sign out:', error);
      setError('An error occurred during sign out. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing Out...' : 'Yes, Sign Out'}
        </button>
        
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 inline-block"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}