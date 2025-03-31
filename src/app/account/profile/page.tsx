import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import getUserProfile from '@/libs/getUserProfile';
import TierBadge from '@/components/TierBadge';

export const metadata: Metadata = {
  title: 'My Profile | CEDT Rentals',
  description: 'View and manage your CEDT rentals account',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/account/profile');
  }

  // Fetch the complete user profile directly from API
  const userProfileResponse = await getUserProfile(session.user.token);
  const userProfile = userProfileResponse.data;
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="py-10 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-medium mb-6">My Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-medium">{userProfile.name}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{userProfile.email}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Telephone Number</p>
              <p className="font-medium">{userProfile.telephone_number}</p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Account Type</p>
              <p className="font-medium capitalize">{userProfile.role}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Total Spend</p>
              <p className="font-medium">${userProfile.total_spend.toFixed(2)}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Membership Tier</p>
              <div className="mt-1">
                <TierBadge tier={userProfile.tier} />
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="font-medium">{formatDate(userProfile.createdAt)}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Account ID</p>
              <p className="font-medium text-xs text-gray-500">{userProfile._id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/account/reservations" 
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View My Reservations
          </Link>
          
          <Link 
            href="/account/change-password" 
            className="inline-block px-4 py-2 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#f8f5f0] transition-colors"
          >
            Change Password
          </Link>
        </div>
      </div>
    </main>
  );
}