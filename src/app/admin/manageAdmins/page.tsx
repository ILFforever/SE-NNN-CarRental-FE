import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import AdminUserManagement from '@/components/AdminUserManagement';

export const metadata: Metadata = {
  title: 'Manage Admin Users | CEDT Rentals',
  description: 'Administrative tools for managing admin users in CEDT Rentals',
};

export default async function ManageAdminPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Administrators</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        Create, or deactivate administrator accounts. All administrators have complete access to management functions.
      </p>
      
      {session?.user?.token ? (
        <AdminUserManagement token={session.user.token} />
      ) : (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Authentication token not available. Please try logging out and back in.
        </div>
      )}
    </main>
  );
}