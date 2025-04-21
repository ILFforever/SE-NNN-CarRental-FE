// src/app/account/profile/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import getUserProfile from '@/libs/getUserProfile';
import ClientProfilePage from '@/components/user/ClientProfilePage';

export const metadata: Metadata = {
  title: 'My Profile | CEDT Rentals',
  description: 'View and manage your CEDT rentals account',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/account/profile');
  }

  try {
    // Fetch the complete user profile directly from API
    const userProfileResponse = await getUserProfile(session.user.token);
    
    if (!userProfileResponse.success) {
      throw new Error(userProfileResponse.message || 'Failed to fetch profile');
    }
    
    const userProfile = userProfileResponse.data;
    
    // Ensure required fields are present
    if (!userProfile || !userProfile._id) {
      throw new Error('Invalid user profile data');
    }
    
    return <ClientProfilePage session={session} userProfile={userProfile} />;
  } catch (error) {
    // Handle errors appropriately
    console.error('Error loading profile:', error);
    // You could redirect to an error page or show an error message
    return <div>Error loading profile. Please try again later.</div>;
  }
}