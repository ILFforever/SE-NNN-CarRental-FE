// src/app/provider/reservations/[reservationId]/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import UnifiedReservationDetails from '@/components/reservations/ReservasionDetails';

export const metadata: Metadata = {
  title: 'Reservation Details | Provider Dashboard',
  description: 'View and manage reservation details for your car',
};

interface PageProps {
  params: {
    reservationId: string;
  };
}

export default async function ProviderReservationDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not a provider
  if (!session || session.user.userType !== 'provider') {
    redirect('/');
  }
  
  return (
    <UnifiedReservationDetails 
      reservationId={params.reservationId} 
      userType="provider"
      backUrl="/provider/reservations" 
    />
  );
}