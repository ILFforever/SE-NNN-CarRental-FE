// src/app/provider/profile/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import ClientProviderProfilePage from '@/components/provider/ClientProviderProfilePage';

export const metadata: Metadata = {
  title: 'My Provider Profile | CEDT Rentals',
  description: 'View and manage your car provider account',
};

async function fetchProviderProfile(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/Car_Provider/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Ensures fresh data on each request
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    throw error;
  }
}

export default async function ProviderProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.userType !== 'provider') {
    redirect('/signin?callbackUrl=/provider/profile');
  }

  try {
    const providerProfile = await fetchProviderProfile(session.user.token);
    
    // Ensure required fields are present
    if (!providerProfile || !providerProfile._id) {
      throw new Error('Invalid provider profile data');
    }
    
    return <ClientProviderProfilePage session={session} providerProfile={providerProfile} />;
  } catch (error) {
    // Handle errors appropriately
    console.error('Error loading profile:', error);
    // You could redirect to an error page or show an error message
    return <div>Error loading profile. Please try again later.</div>;
  }
}