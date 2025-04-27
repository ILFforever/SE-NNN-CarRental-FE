import React from "react";

type ReservationDetailsProps = {
  reservation: any;
};

export const ReservationDetails = ({ reservation }: ReservationDetailsProps) => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 text-sm">Vehicle</p>
          <p className="font-medium">
            {typeof reservation.car === "object"
              ? `${reservation.car.brand} ${reservation.car.model}`
              : "Vehicle details not available"}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Reservation Period</p>
          <p className="font-medium">
            {new Date(reservation.startDate).toLocaleDateString()} -{" "}
            {new Date(reservation.returnDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};
