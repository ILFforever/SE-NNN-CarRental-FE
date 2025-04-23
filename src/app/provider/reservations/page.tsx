import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import ReservationManagement from '@/components/reservations/ReservationManagement';

export const metadata: Metadata = {
  title: 'Manage Reservations | CEDT Rentals',
  description: 'Car provider tools for managing reservations',
};

export default async function ManageReservationPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect('/');
  }
  
  return (
    <main className="py-6 sm:py-10 px-4 max-w-full sm:max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4">
          Manage Reservations
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
          View and manage reservations for your rental fleet.
        </p>
      </div>
      
      {session?.user?.token ? (
        <div className="flex justify-center">
          <div className="w-fit">
            <ReservationManagement token={session.user.token} />
          </div>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800 max-w-lg mx-auto text-center">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}