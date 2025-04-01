import { Metadata } from 'next';
import ProviderRentalManagement from '@/components/ReservationManagement';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Provider Rentals | CEDT Rentals',
  description: 'Manage your rental fleet and track rental activities',
};

export default async function ProviderRentalManagementPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect('/');
  }
  
  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Rentals</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        View and manage all rentals for your fleet of vehicles.
      </p>
      
      {session?.user?.token ? (
        <ProviderRentalManagement />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}