'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AUTH_ENDPOINTS, API_BASE_URL } from '@/config/apiConfig';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState(''); // Only used for car providers
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCarProvider, setIsCarProvider] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');

  // Check URL parameters for account type
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'provider') {
      setIsCarProvider(true);
      handleUserTypeChange('provider');
    }
  }, [searchParams]);

  const handleUserTypeChange = (type: 'customer' | 'provider') => {
    setIsCarProvider(type === 'provider');
    setUserType(type);
  };
  const validateForm = () => {
    if (!name || !email || !telephone || !password || !confirmPassword || (isCarProvider && !address)) {
      setError('All fields are required');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate phone format (XXX-XXXXXXX)
    const phoneRegex = /^\d{3}-\d{7}$/;
    if (!phoneRegex.test(telephone)) {
      setError('Phone number must be in format XXX-XXXXXXX');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Determine which API endpoint to use based on account type
      const endpoint = isCarProvider 
        ? `${API_BASE_URL}/Car_Provider/register` 
        : AUTH_ENDPOINTS.REGISTER;
      
      console.log(`Attempting to register with: ${endpoint}`);
      
      // Create the user data object based on account type
      const userData = isCarProvider 
        ? {
            "name": name,
            "email": email,
            "password": password,
            "telephone_number": telephone,
            "address": address
          }
        : {
            "name": name,
            "email": email,
            "password": password,
            "telephone_number": telephone,
            "role": "user"
          };
  
      console.log('Sending data:', userData);
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      console.log('Registration response status:', response.status);
      const data = await response.json();
      console.log('Registration response data:', data);
  
      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Registration failed');
      }
  
      // Registration successful - redirect to appropriate success page
      if (isCarProvider) {
        router.push('/register/provider-success');
      } else {
        router.push('/register/success');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Could not connect to the server. Please check your internet connection or try again later.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccountType = () => {
    setIsCarProvider(!isCarProvider);
    setError(''); // Clear any previous errors
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-medium mb-4 text-center">Create an Account</h2>
      
      {/* Account type selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              !isCarProvider 
                ? 'bg-[#8A7D55] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() =>  handleUserTypeChange('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              isCarProvider 
                ? 'bg-[#8A7D55] text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() =>  handleUserTypeChange('provider')}
          >
            Car Provider
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-1">
            {isCarProvider ? 'Company Name' : 'Full Name'}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>

        {isCarProvider && (
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 mb-1">
              Company Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="telephone" className="block text-gray-700 mb-1">
            Telephone (XXX-XXXXXXX)
          </label>
          <input
            type="tel"
            id="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="123-4567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8A7D55] text-white py-2 px-4 rounded-md hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : isCarProvider ? 'Register as Provider' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <Link href={`/signin?type=${userType}`} className="text-[#8A7D55] hover:underline">
          Sign In
        </Link>
        {isCarProvider && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          <p className="font-medium">Car Provider Registration</p>
          <p>To get your account vertified please contact an administrator or complete 10 rentals.</p>
        </div>
      )}
      </p>
    </div>
  );
}