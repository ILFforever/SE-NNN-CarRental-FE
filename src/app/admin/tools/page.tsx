// src/app/admin/tools/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { 
  Users, 
  UserCog, 
  Car, 
  Calendar, 
  Building, 
  PlusSquare, 
  Settings
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Tools | CEDT Rentals',
  description: 'Administrative tools for CEDT Rentals',
};


export default async function AdminToolsPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== "admin") {
    redirect("/"); // Server-side redirect
  }

  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-medium mb-4 text-[#8A7D55]">Admin Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Welcome to the administration dashboard. Here you can manage users, car providers,
          vehicles, reservations, and additional services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Admins Panel */}
        <AdminToolCard
          title="Manage Admins"
          description="Create and manage administrator accounts"
          icon={<UserCog size={24} />}
          link="/admin/manageAdmins"
          color="bg-gradient-to-br from-amber-50 to-amber-100"
          iconColor="text-amber-600"
          borderColor="border-amber-200"
        />

        {/* Manage Users Panel */}
        <AdminToolCard
          title="Manage Users"
          description="Manage and monitor user accounts"
          icon={<Users size={24} />}
          link="/admin/manageUsers"
          color="bg-gradient-to-br from-blue-50 to-blue-100"
          iconColor="text-blue-600"
          borderColor="border-blue-200"
        />

        {/* Manage Car Providers Panel */}
        <AdminToolCard
          title="Manage Car Providers"
          description="Add or manage car providers or rental companies"
          icon={<Building size={24} />}
          link="/admin/manageCarproviders"
          color="bg-gradient-to-br from-green-50 to-green-100"
          iconColor="text-green-600"
          borderColor="border-green-200"
        />

        {/* Manage Cars Panel */}
        <AdminToolCard
          title="Manage Cars"
          description="Add and edit vehicles in the rental fleet"
          icon={<Car size={24} />}
          link="/admin/manageCars"
          color="bg-gradient-to-br from-purple-50 to-purple-100"
          iconColor="text-purple-600"
          borderColor="border-purple-200"
        />

        {/* Manage Services Panel - NEW */}
        <AdminToolCard
          title="Manage Services"
          description="Create and manage additional rental services"
          icon={<PlusSquare size={24} />}
          link="/admin/manageServices"
          color="bg-gradient-to-br from-teal-50 to-teal-100"
          iconColor="text-teal-600"
          borderColor="border-teal-200"
          highlight={true}
        />

        {/* System Settings Panel */}
        <AdminToolCard
          title="System Settings"
          description="Configure system parameters and preferences"
          icon={<Settings size={24} />}
          link="/admin/settings"
          color="bg-gradient-to-br from-gray-50 to-gray-100"
          iconColor="text-gray-600"
          borderColor="border-gray-200"
        />
      </div>

      {/* Bookings Panel - Full Width */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-[#8A7D55] mr-3" />
            <h2 className="text-xl font-medium text-[#8A7D55]">Manage Bookings</h2>
          </div>
          <Link
            href="/admin/reservations"
            className="px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View All Bookings
          </Link>
        </div>
        <p className="text-gray-600 mb-4">
          Search, view and edit details about any booking in the system.
        </p>
        <form action="/admin/reservations" method="GET" className="w-full relative">
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

// Admin Tool Card Component
function AdminToolCard({ 
  title, 
  description, 
  icon, 
  link, 
  color, 
  iconColor,
  borderColor,
  highlight = false
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  iconColor: string;
  borderColor: string;
  highlight?: boolean;
}) {
  return (
    <Link href={link} className="block group">
      <div className={`h-full ${color} p-6 rounded-lg shadow-md border ${borderColor} transition-all duration-300 group-hover:shadow-lg ${
        highlight ? 'ring-2 ring-teal-300 relative overflow-hidden' : ''
      }`}>
        {highlight && (
          <div className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs px-3 py-1 transform rotate-12 shadow-md">
            New
          </div>
        )}
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