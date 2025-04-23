import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import UnifiedCarManagement from '@/components/cars/CarManagement';

export const metadata: Metadata = {
  title: 'Manage Cars | CEDT Rentals',
  description: 'Administrative tools for managing cars in the CEDT Rentals fleet',
};

export default async function ManageCarsPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <main className="py-6 sm:py-10 px-4 max-w-full sm:max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4">
          Manage Cars
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
          Add, edit, or deactivate cars in the rental fleet. All cars must be associated with a car provider.
        </p>
      </div>
      
      {session?.user?.token ? (
        <div className="flex justify-center">
          <div className="w-fit">
            <UnifiedCarManagement 
              token={session.user.token} 
              userType="admin"
            />
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