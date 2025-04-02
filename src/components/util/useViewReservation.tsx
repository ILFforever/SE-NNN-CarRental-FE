'use client';

import { useRouter } from 'next/navigation';

export const viewReservation = (router: ReturnType<typeof useRouter>, reservationId: string) => {
    if (!reservationId) {
      console.error('Reservation ID is required to view the reservation');
      return;
    }
  
    // Redirect to the reservation details page
    router.push(`/account/reservations/${reservationId}`);
  };
  