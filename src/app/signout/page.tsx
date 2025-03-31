import { Metadata } from 'next';
import ClientSignOutConfirmation from '@/components/ClientSignOutConfirmation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign Out | CEDT Rentals',
  description: 'Sign out of your CEDT Rentals account',
};

interface PageProps {
  searchParams?: { callbackUrl?: string };
}

export default async function SignOutPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // If user is not signed in, redirect to home
  if (!session) {
    redirect('/');
  }
  
  const callbackUrl = searchParams?.callbackUrl || '/';

  return (
    <main className="py-16 px-4">
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#f8f5f0]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#8A7D55]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-medium mb-4 font-serif">Sign Out</h1>
        
        <p className="text-gray-600 mb-8">
          Are you sure you want to sign out of your CEDT Rentals account?
        </p>
        
        <ClientSignOutConfirmation callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}