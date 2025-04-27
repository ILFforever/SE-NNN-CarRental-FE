// src/app/provider/tools/page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Car, 
  Calendar, 
  UserCog, 
  Settings,
  PlusSquare
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Provider Tools | CEDT Rentals',
  description: 'Management tools for car providers',
};

// Tool card component similar to the admin dashboard
function ProviderToolCard({ 
  title, 
  description, 
  icon, 
  link, 
  color, 
  iconColor,
  borderColor,
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  iconColor: string;
  borderColor: string;
}) {
  return (
    <Link href={link} className="block group">
      <div className={`h-full ${color} p-6 rounded-lg shadow-md border ${borderColor} transition-all duration-300 group-hover:shadow-lg`}>
        <div className={`flex items-center justify-center rounded-full w-12 h-12 ${color} ${iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2 group-hover:text-[#8A7D55] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default async function ProviderToolsPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect("/"); // Server-side redirect
  }

  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-medium mb-4 text-[#8A7D55]">Provider Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage your fleet, track rentals, and oversee your business operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Cars Panel */}
        <ProviderToolCard
          title="Manage Cars"
          description="Add, update, or manage vehicles in your fleet"
          icon={<Car size={24} />}
          link="/provider/manageCars"
          color="bg-gradient-to-br from-blue-50 to-blue-100"
          iconColor="text-blue-600"
          borderColor="border-blue-200"
        />

        {/* Provider Profile Panel */}
        <ProviderToolCard
          title="Provider Profile"
          description="View and update your company details"
          icon={<UserCog size={24} />}
          link="/provider/profile"
          color="bg-gradient-to-br from-purple-50 to-purple-100"
          iconColor="text-purple-600"
          borderColor="border-purple-200"
        />

        {/* Business Dashboard Panel */}
        <ProviderToolCard
          title="Business Dashboard"
          description="View rental statistics and revenue insights"
          icon={<Settings size={24} />}
          link="/provider/dashboard"
          color="bg-gradient-to-br from-amber-50 to-amber-100"
          iconColor="text-amber-600"
          borderColor="border-amber-200"
        />
      </div>

      {/* Bookings Panel - Full Width */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-[#8A7D55] mr-3" />
            <h2 className="text-xl font-medium text-[#8A7D55]">Upcoming Rentals</h2>
          </div>
          <Link
            href="/provider/reservations"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View All Bookings
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          Quick overview of your upcoming vehicle rentals.
        </p>
        <form action="/provider/reservations" method="GET" className="w-full relative">
          <input
            type="text"
            name="search"
            placeholder="Search by booking ID, customer name, or car details..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A7D55] pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}