// src/app/provider/manageCars/edit/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import CarEditForm from '@/components/util/CarEditForm';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function EditCarPage() {
  useScrollToTop();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const carId = searchParams.get('carId');
  
  // Redirect if not logged in as provider
  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.userType !== 'provider')) {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <main className="py-10 px-4 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-medium">Edit Car</h1>
        <Link 
          href="/provider/manageCars"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Cars
        </Link>
      </div>

      {session?.user?.token ? (
        <CarEditForm 
          carId={carId || undefined}
          token={session.user.token}
          providerId={session.user.id || session.user._id}
          backUrl="/provider/manageCars"
        />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}