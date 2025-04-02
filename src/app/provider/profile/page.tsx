// src/app/provider/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/apiConfig';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface ProviderProfile {
  _id: string;
  name: string;
  email: string;
  telephone_number: string;
  address: string;
  createdAt: string;
}

export default function ProviderProfilePage() {
  useScrollToTop();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    telephone_number: '',
    address: ''
  });

  // Redirect if not logged in as provider
  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.userType !== 'provider')) {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch provider profile data
  useEffect(() => {
    const fetchProviderProfile = async () => {
      if (!session?.user?.token) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/Car_Provider/me`, {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch provider profile');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setProfile(data.data);
          // Initialize edit form with current values
          setEditForm({
            name: data.data.name || '',
            telephone_number: data.data.telephone_number || '',
            address: data.data.address || ''
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching provider profile:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session?.user?.token) {
      fetchProviderProfile();
    }
  }, [session]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/Car_Provider/${profile?._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setProfile(data.data);
        setIsEditing(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <main className="py-10 px-4 max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A7D55]"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-10 px-4 max-w-3xl mx-auto">
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <h2 className="text-xl font-medium mb-2">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-[#8A7D55] text-white rounded-md"
            onClick={() => router.refresh()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-medium mb-6">Provider Profile</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        {!isEditing ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Company Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">Telephone Number</p>
                  <p className="font-medium">{profile?.telephone_number}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm">Member Since</p>
                  <p className="font-medium">{profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm">Address</p>
                  <p className="font-medium">{profile?.address}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm">Provider ID</p>
                  <p className="font-medium text-xs text-gray-500">{profile?._id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
              >
                Edit Profile
              </button>
              
              <button
                onClick={() => router.push('/provider/tools')}
                className="inline-block px-4 py-2 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#f8f5f0] transition-colors"
              >
                Back to Tools
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Edit Profile</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="name">
                  Company Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="telephone_number">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  id="telephone_number"
                  name="telephone_number"
                  value={editForm.telephone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
                />
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{profile?.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Please contact support if you need to update your email address.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Additional sections could be added here, such as:
      - Password change form
      - API keys or access tokens
      - Business verification status
      - Account statistics
      */}
    </main>
  );
}