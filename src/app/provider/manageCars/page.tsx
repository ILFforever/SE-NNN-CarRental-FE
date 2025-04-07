// src/app/provider/manageCars/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import UnifiedCarManagement from '@/components/cars/CarManagement';

export const metadata: Metadata = {
  title: 'Manage Cars | CEDT Rentals',
  description: 'Tools for managing your cars in the CEDT Rentals fleet',
};

export default async function ProviderManageCarsPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect('/');
  }
  
  // Get provider ID from session
  const providerId = session.user.id || session.user._id;
  
  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Your Cars</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        Add, edit, or manage your cars in the rental fleet.
      </p>
      
      {session?.user?.token ? (
        <UnifiedCarManagement 
          token={session.user.token} 
          userType="provider"
          providerId={providerId}
        />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}