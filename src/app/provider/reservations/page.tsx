import { Metadata } from 'next';
import ProviderRentalManagement from '@/components/provider/ProvidermanageReservation';

export const metadata: Metadata = {
  title: 'Manage Rentals | CEDT Rentals',
  description: 'Manage and track your rental fleet',
};

export default function ProviderManageReservationPage() {

  return (
    <main className="py-10 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-medium mb-6 text-center">Manage Rentals</h1>
      <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        View, manage, and track rentals for your car fleet.
      </p>

      <ProviderRentalManagement  />
    </main>
  );
}