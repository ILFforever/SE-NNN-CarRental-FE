// src/app/provider/tools/page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Provider Tools | CEDT Rentals',
  description: 'Management tools for car providers',
};

export default async function ProviderToolsPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect("/"); // Server-side redirect
  }

  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-8 text-center">Provider Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Cars Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Manage Cars</h2>
          <p className="text-gray-600 mb-4">Add, update, or deactivate cars in your fleet.</p>
          <Link
            href="/provider/manageCars"
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Manage My Cars
          </Link>
        </div>

        {/* Manage Rentals Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Manage Rentals</h2>
          <p className="text-gray-600 mb-4">View and manage all rentals for your fleet.</p>
          <Link
            href="/provider/manageReservation"
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            Manage Rentals
          </Link>
        </div>

        {/* Provider Profile Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Provider Profile</h2>
          <p className="text-gray-600 mb-4">Update your company details and contact information.</p>
          <Link
            href="/provider/profile"
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View Profile
          </Link>
        </div>

        {/* Business Dashboard Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium mb-4 text-[#8A7D55]">Business Dashboard</h2>
          <p className="text-gray-600 mb-4">View rental statistics and revenue for your fleet.</p>
          <Link
            href="/provider/dashboard"
            className="inline-block px-4 py-2 bg-[#8A7D55] text-white rounded-md hover:bg-[#766b48] transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}