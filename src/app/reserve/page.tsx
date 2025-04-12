"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addBooking } from "@/redux/features/bookSlice";
import { useSession } from "next-auth/react";
import getUserProfile from "@/libs/getUserProfile";
import { API_BASE_URL } from "@/config/apiConfig";
import { useScrollToTop } from "@/hooks/useScrollToTop";

// Import components
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import CarDetails from "@/components/cars/CarDetails";
import BookingForm from "@/components/reservations/BookingForm";
import ReservationSummary from "@/components/reservations/ReservationSummary";

// Import utils and services
import { getTotalCost, createDateTimeObject } from "@/libs/bookingUtils";
import { checkCarAvailability } from "@/libs/carAvailability";
import { makeBooking } from "@/libs/bookingService";

export default function Booking() {
  useScrollToTop();
  const router = useRouter();
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.userType === "provider") {
      router.back(); // Go back to previous page
    }
  }, [session, router]);
  
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name: string;
    telephone_number: string | undefined;
  } | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  const [nameLastname, setNameLastname] = useState<string>("");
  const [tel, setTel] = useState<string>("");
  const [userTier, setUserTier] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  
  // Date and time states
  const [pickupDate, setPickupDate] = useState<dayjs.Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<dayjs.Dayjs | null>(null);
  const [pickupTime, setPickupTime] = useState<string>("10:00 AM");
  const [returnTime, setReturnTime] = useState<string>("10:00 AM");
  
  // DateTime objects that combine date and time
  const [pickupDateTime, setPickupDateTime] = useState<dayjs.Dayjs | null>(null);
  const [returnDateTime, setReturnDateTime] = useState<dayjs.Dayjs | null>(null);
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // States for availability checking
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [formValid, setFormValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check form validity whenever relevant fields change
  useEffect(() => {
    const isValid =
      nameLastname.trim() !== "" &&
      tel.trim() !== "" &&
      pickupDateTime !== null &&
      returnDateTime !== null &&
      isAvailable;
    setFormValid(isValid);
  }, [nameLastname, tel, pickupDateTime, returnDateTime, isAvailable]);

  // Callback for checking car availability
  const handleCheckCarAvailability = useCallback(async () => {
    if (!car?._id || !pickupDateTime || !returnDateTime || !session?.user?.token) {
      return; // Don't check if we don't have all the required data
    }
    
    setIsCheckingAvailability(true);
    setAvailabilityMessage("Checking availability...");
    
    try {
      // ใช้ pickup/return DateTime ในการเช็คความพร้อมใช้งาน
      const result = await checkCarAvailability(
        car._id,
        pickupDateTime,
        returnDateTime,
        session.user.token
      );
      
      setIsAvailable(result.isAvailable);
      setAvailabilityMessage(result.availabilityMessage);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [car?._id, pickupDateTime, returnDateTime, session?.user?.token]);

  // Check availability whenever dates or times change
  useEffect(() => {
    const shouldCheckAvailability = 
      pickupDateTime !== null && 
      returnDateTime !== null && 
      car !== null;
    
    if (shouldCheckAvailability) {
      handleCheckCarAvailability();
    }
  }, [pickupDateTime, returnDateTime, car, handleCheckCarAvailability]);

  // Add this effect to fetch services data when the component mounts
  useEffect(() => {
    const fetchServices = async () => {
      if (!session?.user?.token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/services`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setServices(
              data.data.filter((s: Service) => s.available !== false)
            );
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [session?.user?.token]);

  // Handle booking submission
  const handleMakeBooking = async () => {
    if (!formValid || isSubmitting || !car || !pickupDateTime || !returnDateTime || !session?.user?.token) {
      return;
    }
  
    setIsSubmitting(true);
    try {
      // ใช้ datetime objects ในการสร้างการจอง
      const result = await makeBooking(
        car._id,
        pickupDateTime,
        returnDateTime,
        selectedServices,
        services,
        userTier,
        car.dailyRate || 0,
        session.user.token
      );

      if (result.success) {
        // Booking successful, dispatch to Redux store
        const item = {
          nameLastname: nameLastname,
          tel: tel,
          car: car._id,
          // บันทึกทั้งวันที่และเวลาในรูปแบบ ISO string
          bookDateTime: pickupDateTime.toISOString(),
          returnDateTime: returnDateTime.toISOString(),
          // ยังคงเก็บเฉพาะวันที่และเวลาแยกกันไว้ด้วยสำหรับการแสดงผล
          bookDate: pickupDateTime.format("YYYY/MM/DD"),
          returnDate: returnDateTime.format("YYYY/MM/DD"),
          pickupTime: pickupTime,
          returnTime: returnTime,
        };
        
        console.log(item);
        dispatch(addBooking(item));
        alert("Booking successful!");

        // Redirect to reservations page
        router.push("/account/reservations");
      } else {
        alert(result.message);
        if (result.message.includes("not available")) {
          setIsAvailable(false);
          setAvailabilityMessage(result.message);
        }
      }
    } catch (error) {
      console.error("Error booking:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch car details and user profile
  useEffect(() => {
    const carId = searchParams.get("carId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const providedPickupTime = searchParams.get("pickupTime") || "10:00 AM";
    const providedReturnTime = searchParams.get("returnTime") || "10:00 AM";

    const fetchData = async () => {
      // Fetch car details
      if (!carId) {
        setError("No car ID provided");
        setLoading(false);
        return;
      }

      if (!session?.user?.token) {
        setError("Please sign in to make a reservation");
        setLoading(false);
        return;
      }

      try {
        // Fetch car details
        const carResponse = await fetch(`${API_BASE_URL}/cars/${carId}`, {
          headers: { Authorization: `Bearer ${session.user.token}` },
        });

        if (!carResponse.ok) {
          throw new Error("Failed to fetch car details");
        }

        const carData = await carResponse.json();

        // Check car for fetch
        if (carData.success && carData.data) {
          setCar(carData.data);

          // Fetch provider details (name and verified status)
          const providerId = carData.data.provider_id; // Assuming provider_id is available in car data
          const providerResponse = await fetch(
            `${API_BASE_URL}/Car_Provider/${providerId}`,
            { headers: { Authorization: `Bearer ${session.user.token}` } }
          );

          if (!providerResponse.ok) {
            console.log("test : ", providerResponse);
            throw new Error("Failed to fetch provider details");
          }

          const providerData = await providerResponse.json();

          if (providerData.success && providerData.data) {
            setProvider({
              name: providerData.data.name,
              verified: providerData.data.verified,
            });
          } else {
            throw new Error("Invalid provider data received");
          }
        } else {
          throw new Error("Invalid car data received");
        }

        // Fetch user profile
        const userProfileResponse = await getUserProfile(session.user.token);

        if (userProfileResponse.success && userProfileResponse.data) {
          setUserData({
            name: userProfileResponse.data.name,
            telephone_number: userProfileResponse.data.telephone_number,
          });

          // Prefill form with user data
          setNameLastname(userProfileResponse.data.name);
          setTel(userProfileResponse.data.telephone_number || "");
          setUserTier(userProfileResponse.data.tier);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    // Prefill dates and times
    if (startDate) {
      setPickupDate(dayjs(startDate));
    }
    if (endDate) {
      setReturnDate(dayjs(endDate));
    }
    if (providedPickupTime) {
      setPickupTime(providedPickupTime);
    }
    if (providedReturnTime) {
      setReturnTime(providedReturnTime);
    }

    fetchData();
  }, [searchParams, session]);

  // อัพเดท pickupDateTime และ returnDateTime เมื่อ pickupDate/returnDate หรือ pickupTime/returnTime เปลี่ยน
  useEffect(() => {
    if (pickupDate && pickupTime) {
      const dateTimeObj = createDateTimeObject(pickupDate, pickupTime);
      setPickupDateTime(dateTimeObj);
    }
  }, [pickupDate, pickupTime]);

  useEffect(() => {
    if (returnDate && returnTime) {
      const dateTimeObj = createDateTimeObject(returnDate, returnTime);
      setReturnDateTime(dateTimeObj);
    }
  }, [returnDate, returnTime]);

  // Update price when relevant fields change
  useEffect(() => {
    if (car?.dailyRate && pickupDateTime && returnDateTime) {
      // ใช้ DateTime objects ในการคำนวณราคา
      setPrice(
        getTotalCost(
          pickupDateTime,
          returnDateTime,
          car.dailyRate,
          selectedServices,
          services,
          userTier
        )
      );
    }
  }, [
    pickupDateTime,
    returnDateTime,
    car?.dailyRate,
    userTier,
    selectedServices,
    services,
  ]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-10 px-4 text-center">
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto py-10 px-4 text-center">
        <ErrorState error={error} isLoggedIn={!!session} />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-medium mb-3 font-serif">
          Make Your Reservation
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Complete the details below to reserve your premium vehicle
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Car Details */}
        {car && (
          <CarDetails
            car={car}
            isAvailable={isAvailable}
            session={session}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
          />
        )}

        {/* Booking Form */}
        <BookingForm
          nameLastname={nameLastname}
          setNameLastname={setNameLastname}
          tel={tel}
          setTel={setTel}
          pickupDate={pickupDate}
          setPickupDate={setPickupDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          pickupTime={pickupTime}
          setPickupTime={setPickupTime}
          returnTime={returnTime}
          setReturnTime={setReturnTime}
          isAvailable={isAvailable}
          isCheckingAvailability={isCheckingAvailability}
          availabilityMessage={availabilityMessage}
          providerId={car?.provider_id}
          token={session?.user?.token}
          pickupDateTime={pickupDateTime}
          setPickupDateTime={setPickupDateTime}
          returnDateTime={returnDateTime}
          setReturnDateTime={setReturnDateTime}
        />
      </div>

      {/* Reservation Summary */}
      {car && pickupDateTime && returnDateTime && (
        <ReservationSummary
          car={car}
          pickupDate={pickupDateTime}
          returnDate={returnDateTime}
          pickupTime={pickupTime}
          returnTime={returnTime}
          userTier={userTier}
          selectedServices={selectedServices}
          services={services}
          formValid={formValid}
          isSubmitting={isSubmitting}
          onSubmit={handleMakeBooking}
        />
      )}
    </main>
  );
}