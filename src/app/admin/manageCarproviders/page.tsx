import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import CarProviderManagement from '@/components/admin/CarProviderManagement';

export const metadata: Metadata = {
  title: 'Manage Car Providers | CEDT Rentals',
  description: 'Administrative tools for managing car providers in CEDT Rentals',
};

export default async function ManageCarProvidersPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <main className="py-6 sm:py-10 px-4 max-w-full sm:max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6 text-center">
        Manage Car Providers
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
        Create, manage, and verify car providers who supply vehicles to our rental service.
      </p>
      
      {session?.user?.token ? (
        <CarProviderManagement token={session.user.token} />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800 max-w-lg mx-auto text-center">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}