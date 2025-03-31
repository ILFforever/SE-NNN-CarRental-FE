'use client';

import { Metadata } from 'next';
import { getTierName, getTierColorClass, getTierBenefits } from '@/utils/tierUtils';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import getUserProfile from '@/libs/getUserProfile';

// Metadata is handled in layout for client components

// Component for tier card display
function TierCard({ tier, name, color, benefits }: { tier: number, name: string, color: string, benefits: string[] }) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${color}`}>
      <div className="p-6">
        <h3 className="text-xl font-serif mb-2">{name} Tier</h3>
        <p className="text-sm text-gray-500 mb-4">
          {tier === 0 ? 'Available to all customers' : `Achieved at $${tier * 10000} total spend`}
        </p>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Component for displaying user's current tier and progress
function UserTierProgress({ userTier, totalSpend }: { userTier: number, totalSpend: number }) {
  // Calculate progress to next tier
  const currentTierThreshold = userTier * 10000;
  const nextTierThreshold = (userTier + 1) * 10000;
  const progressToNextTier = Math.min(100, ((totalSpend - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Your Current Tier</h3>
          <div className="flex items-center mt-1">
            <span className={`text-2xl font-bold ${getTierColorClass(userTier)}`}>
              {getTierName(userTier)}
            </span>
            {userTier < 4 && (
              <span className="ml-2 text-sm text-gray-500">
                Next tier: {getTierName(userTier + 1)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Spend</div>
          <div className="text-xl font-bold">{formatCurrency(totalSpend)}</div>
        </div>
      </div>
      
      {userTier < 4 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to {getTierName(userTier + 1)}</span>
            <span>{formatCurrency(totalSpend)} / {formatCurrency(nextTierThreshold)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${userTier === 0 ? 'bg-gray-500' : userTier === 1 ? 'bg-yellow-500' : userTier === 2 ? 'bg-blue-400' : 'bg-teal-500'}`}
              style={{ width: `${progressToNextTier}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {formatCurrency(nextTierThreshold - totalSpend)} more to reach {getTierName(userTier + 1)}
          </div>
        </div>
      )}
      
      {userTier >= 4 && (
        <div className="mt-4 text-teal-600 font-medium">
          Congratulations! You've reached our highest tier level.
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (session?.user?.token) {
        setIsLoading(true);
        try {
          const response = await getUserProfile(session.user.token);
          setUserProfile(response.data);
        } catch (err) {
          setError('Could not load your profile information');
          console.error('Error fetching user profile:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchUserProfile();
  }, [session]);


  // Define benefits for each tier
  const tierBenefits = [
    { // Bronze (Tier 0)
      color: "border-yellow-700",
      benefits: [
        "Access to standard vehicle fleet",
        "Standard insurance coverage",
        "24/7 customer support",
        "Online booking system",
        "Free cancellation up to 24 hours"
      ]
    },
    { // Silver (Tier 1)
      color: "border-gray-500",
      benefits: [
        "All Bronze benefits",
        "5% discount on all rentals",
        "Priority vehicle pickup",
        "Free GPS navigation",
        "Extended reservation holds"
      ]
    },
    { // Gold (Tier 2)
      color: "border-yellow-500",
      benefits: [
        "All Silver benefits",
        "10% discount on all rentals",
        "Access to premium vehicle selections",
        "Free additional driver registration",
        "Flexible pickup and return times"
      ]
    },
    { // Platinum (Tier 3)
      color: "border-blue-400",
      benefits: [
        "All Gold benefits",
        "15% discount on all rentals",
        "Complimentary vehicle upgrades when available",
        "Priority concierge service",
        "Exclusive weekend promotions"
      ]
    },
    { // Diamond (Tier 4)
      color: "border-teal-500",
      benefits: [
        "All Platinum benefits",
        "20% discount on all rentals",
        "Exclusive access to luxury vehicle fleet",
        "Dedicated personal concierge",
        "Airport meet & greet service",
        "Guaranteed vehicle availability"
      ]
    }
  ];

  // Additional services sections
  const premiumServices = [
    {
      title: "Chauffeur Service",
      description: "Professional drivers available for all vehicles in our fleet. Perfect for business travel or special occasions.",
      icon: "🧑‍✈️"
    },
    {
      title: "Airport Transfers",
      description: "Convenient pickup and drop-off service at all major airports. Skip the taxi line and travel in comfort.",
      icon: "✈️"
    },
    {
      title: "Vehicle Delivery",
      description: "Have your selected vehicle delivered directly to your doorstep or hotel. Available within city limits.",
      icon: "🚚"
    },
    {
      title: "Extended Hours",
      description: "Early morning or late night pickup and return options for the busiest schedules.",
      icon: "🕰️"
    }
  ];

  const specialPackages = [
    {
      title: "Weekend Getaway",
      description: "Special rates for weekend rentals with unlimited mileage and late Sunday returns.",
      icon: "🏞️"
    },
    {
      title: "Business Travel",
      description: "Corporate rates and dedicated billing options for business travelers.",
      icon: "💼"
    },
    {
      title: "Wedding Transport",
      description: "Luxury vehicles for your special day, including decoration options and champagne service.",
      icon: "💍"
    },
    {
      title: "Extended Rental Discount",
      description: "Progressive discounts for rentals longer than one week, with the best rates for monthly rentals.",
      icon: "📅"
    }
  ];

  return (
    <main className="py-16 px-4 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-serif mb-4">Our Premium Services</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Experience unparalleled luxury and convenience with our curated selection of services designed for the most discerning clients.
        </p>
      </section>

      {/* Membership Tiers Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif mb-3">Membership Tiers</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our loyalty program rewards your continued patronage with progressively enhanced benefits and exclusive privileges. Tiers are automatically assigned based on your total rental spending.
          </p>
        </div>
        
        {/* Show user tier progress if logged in */}
        {session && userProfile && !isLoading && (
          <UserTierProgress userTier={userProfile.tier} totalSpend={userProfile.total_spend} />
        )}
        
        {isLoading && session && (
          <div className="text-center py-4 mb-12 bg-white rounded-lg shadow-md">
            <div className="animate-pulse flex justify-center">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2.5"></div>
            </div>
            <div className="animate-pulse h-2.5 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your membership information...</p>
          </div>
        )}
        
        {
        error && (
          <div className="text-center py-4 mb-8 bg-red-50 text-red-700 rounded-lg">
            {error}. Please try refreshing the page.
          </div>
        )
        }

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2].map((tier) => (
            <TierCard 
              key={tier}
              tier={tier}
              name={getTierName(tier)}
              color={tierBenefits[tier].color}
              benefits={tierBenefits[tier].benefits}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {[3, 4].map((tier) => (
            <TierCard 
              key={tier}
              tier={tier}
              name={getTierName(tier)}
              color={tierBenefits[tier].color}
              benefits={tierBenefits[tier].benefits}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          {!session ? (
            <Link 
              href="/signin?callbackUrl=/services" 
              className="inline-block px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
            >
              Sign In to View Your Tier Status
            </Link>
          ) : (
            <Link 
              href="/catalog" 
              className="inline-block px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
            >
              Book Now to Increase Your Tier
            </Link>
          )}
        </div>
        </section>
 {/* Premium Services Section */}
 <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif mb-3">Premium Services</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Enhance your rental experience with our additional premium services, available to all customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {premiumServices.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="text-3xl mr-4">{service.icon}</div>
              <div>
                <h3 className="text-xl font-serif mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Special Packages Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif mb-3">Special Packages</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Curated packages designed for specific occasions and requirements, offering excellent value and convenience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialPackages.map((pkg, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="text-3xl mr-4">{pkg.icon}</div>
              <div>
                <h3 className="text-xl font-serif mb-2">{pkg.title}</h3>
                <p className="text-gray-600">{pkg.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#f8f5f0] p-10 rounded-lg text-center">
        <h2 className="text-3xl font-serif mb-4">Ready to Experience Luxury?</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
          Contact our concierge team to customize your rental experience or learn more about our exclusive services and membership benefits.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/booking" 
            className="inline-block px-6 py-3 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Book Your Vehicle
          </Link>
          <Link 
            href="/contact" 
            className="inline-block px-6 py-3 border border-[#8A7D55] text-[#8A7D55] rounded-md hover:bg-[#8A7D55] hover:text-white transition-colors"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </main>
  );
}