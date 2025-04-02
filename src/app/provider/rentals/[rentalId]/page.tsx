// src/app/provider/rentals/[rentalId]/page.tsx

import { Metadata } from 'next';
import ProviderRentalDetailsPage from '@/components/provider/ProviderRentalDetailsPage';

export const metadata: Metadata = {
  title: 'Rental Details | Provider Dashboard',
  description: 'View and manage rental details for your car',
};

interface PageProps {
  params: {
    rentalId: string;
  };
}

export default function ProviderRentalPage({ params }: PageProps) {
  return <ProviderRentalDetailsPage params={params} />;
}