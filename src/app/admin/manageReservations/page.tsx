import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import ReservationManagement  from '@/components/ReservationManagement';

export const metadata: Metadata = {
  title: 'Manage Reservasions | CEDT Rentals',
  description: 'Administrative tools for managing reservasions in CEDT Rentals',
};

export default async function ManageReservationPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Reservations</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        View, create, or deactivate reservasions from this management dashboard.
      </p>
      
      {session?.user?.token ? (
        <ReservationManagement token={session.user.token} />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}