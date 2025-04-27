import React from "react";
import { VehicleInfoItem } from "./items/VehicleInfoItem";
import { RentalPeriodItem } from "./items/RentalPeriodItem";
import { TimeInfoItem } from "./items/TimeInfoItem";
import { ReservationStatusItem } from "./items/ReservationStatusItem";
import { NoteMessage } from "./NoteMessage";

type ReservationCardProps = {
  reservation: any;
  startDate: Date;
  returnDate: Date;
  rentalDays: number;
  depositAmount: number;
  remainingAmount: number;
  formatDate: (date: Date) => string;
};

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  startDate,
  returnDate,
  rentalDays,
  depositAmount,
  remainingAmount,
  formatDate,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium mb-5 text-gray-800 border-b pb-3">
        Reservation Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <VehicleInfoItem car={reservation.car} />
        <RentalPeriodItem
          startDate={startDate}
          returnDate={returnDate}
          rentalDays={rentalDays}
          formatDate={formatDate}
        />
        <TimeInfoItem
          pickupTime={reservation.pickupTime}
          returnTime={reservation.returnTime}
        />
        <ReservationStatusItem reservationId={reservation._id} />
      </div>

      <NoteMessage
        depositAmount={depositAmount}
        remainingAmount={remainingAmount}
      />
    </div>
  );
};
