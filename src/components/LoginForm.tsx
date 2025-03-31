'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import carproviderLogin from '@/libs/carproviderLogIn';

export default function LoginForm({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCarProvider, setIsCarProvider] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'provider'>('customer');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      if (isCarProvider) {
        try {
          const result = await carproviderLogin(email, password);
          if (!result.success || !result.token) {
            throw new Error(result.message || 'Invalid credentials');
          }
          router.push('/'); //send us to home
        } catch (error) {
          console.error('Car provider login error:', error);
          setError(error instanceof Error ? error.message : 'Invalid credentials. Please try again.');
          setIsLoading(false);
          return;
        }
      } else {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
          callbackUrl,
        });

        if (result?.error) {
          setError(result.error === "Invalid credentials" ? 'Invalid email or password. Please try again.' : result.error || 'Failed to sign in. Please try again.');
          setIsLoading(false);
          return;
        }

        if (result?.url) {
          router.push(result.url);
          router.refresh();
        } else {
          setError('Something went wrong. Please try again.');
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An unexpected error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-medium mb-4">Sign In</h2>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!isCarProvider ? 'bg-[#8A7D55] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => handleUserTypeChange('customer')}
            >
              Customer
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${isCarProvider ? 'bg-[#8A7D55] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
              onClick={() => handleUserTypeChange('provider')}
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
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            placeholder={isCarProvider ? "Car Provider Email" : "User Email"}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55]"
            placeholder="Password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8A7D55] text-white py-2 px-4 rounded-md hover:bg-[#766b48] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8A7D55] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : `Sign In as ${isCarProvider ? 'Car Provider' : 'User'}`}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href={`/register?type=${userType}`} className="text-[#8A7D55] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
