// src/app/admin/reservations/[reservationId]/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { redirect } from 'next/navigation';
import UnifiedReservationDetails from '@/components/reservations/ReservationDetails';

export const metadata: Metadata = {
  title: 'Reservation Details | Admin Dashboard',
  description: 'View and manage reservation details for the selected booking',
};

interface PageProps {
  params: {
    reservationId: string;
  };
}

export default async function AdminReservationDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  // Redirect if not logged in or not an admin
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <UnifiedReservationDetails 
      reservationId={params.reservationId} 
      userType="admin"
      backUrl="/admin/reservations" 
    />
  );
}
