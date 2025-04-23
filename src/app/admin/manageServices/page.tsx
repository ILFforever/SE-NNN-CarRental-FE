'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminServiceComponent from '@/components/admin/AdminServiceManage';

export default function ManageServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'admin')) {
      router.push('/');
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <main className="py-6 sm:py-10 px-4 max-w-full sm:max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      </main>
    );
  }

  // Only render content if user is authenticated and is an admin
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return (
      <main className="py-6 sm:py-10 px-4 max-w-full sm:max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6 text-center">
          Manage Additional Services
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
          Create, update, and manage additional services that customers can add to their car rentals.
        </p>
        
        {/* AdminServiceManagement */}
        <AdminServiceComponent />
      </main>
    );
  }
  
  return null;
}