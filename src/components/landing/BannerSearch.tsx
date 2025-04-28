"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Clock, Search, ChevronDown } from "lucide-react";
import SimpleTimePicker from "./timePicker";

type SearchField =
  | "location"
  | "pickup-date"
  | "pickup-time"
  | "return-date"
  | "return-time"
  | null;

export default function BannerSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Dayjs | null>(null);
  const [returnDate, setReturnDate] = useState<Dayjs | null>(null);
  const [activeField, setActiveField] = useState<SearchField>(null);
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnTime, setReturnTime] = useState("10:00 AM");
  const [isPickupDateOpen, setIsPickupDateOpen] = useState(false);
  const [isReturnDateOpen, setIsReturnDateOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const locations = [
    { name: "London", type: "City", icon: "🏙️" },
    { name: "Heathrow Airport", type: "Airport", icon: "✈️" },
    { name: "Manchester", type: "City", icon: "🏙️" },
    { name: "Edinburgh", type: "City", icon: "🏙️" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveField(null);
        setIsPickupDateOpen(false);
        setIsReturnDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const pickupFormatted = pickupDate ? pickupDate.format("YYYY-MM-DD") : "";
    const returnFormatted = returnDate ? returnDate.format("YYYY-MM-DD") : "";
    router.push(
      `/catalog?location=${encodeURIComponent(
        location
      )}&startDate=${pickupFormatted}&pickupTime=${encodeURIComponent(
        pickupTime
      )}&endDate=${returnFormatted}&returnTime=${encodeURIComponent(
        returnTime
      )}`
    );
  };

  const renderLocationDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
    >
      <div className="p-2">
        <div
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
          onClick={() => {
            setLocation("Current Location");
            setActiveField(null);
          }}
        >
          <MapPin className="mr-3 text-gray-500" size={18} />
          <span>Current Location</span>
        </div>
        <div className="border-t my-2"></div>
        <div className="text-xs text-gray-500 px-4 mb-2">
          Popular Locations (Beta)
        </div>
        {locations.map((loc, index) => (
          <div
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={() => {
              setLocation(loc.name);
              setActiveField(null);
            }}
          >
            <span className="mr-3 text-lg">{loc.icon}</span>
            <div>
              <div className="font-medium">{loc.name}</div>
              <div className="text-xs text-gray-500">{loc.type}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderDateTimeField = (
    type: "pickup" | "return",
    date: Dayjs | null,
    time: string,
    setDate: (d: Dayjs | null) => void,
    setTime: (t: string) => void,
    isDatePickerOpen: boolean,
    setIsDatePickerOpen: (isOpen: boolean) => void
  ) => (
    <div className="relative flex-1 border-l border-gray-200 pl-2">
      <div className="flex flex-col px-3 py-2">
        {/* Date section */}
        <div
          className="flex items-center space-x-2 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setActiveField(null);
            setIsDatePickerOpen(!isDatePickerOpen);
          }}
        >
          <Calendar
            className="text-gray-500 group-hover:text-black"
            size={18}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={date}
              onChange={(newValue) => {
                setDate(newValue);
                setIsDatePickerOpen(false);
              }}
              open={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              slotProps={{
                textField: {
                  variant: "standard",
                  InputProps: {
                    disableUnderline: true,
                    endAdornment: null, // removes calendar icon
                    className: "text-sm cursor-pointer",
                    readOnly: true,
                  },
                  placeholder: `${
                    type === "pickup" ? "Pickup" : "Return"
                  } Date`,
                  onClick: (e) => {
                    e.stopPropagation();
                    setIsDatePickerOpen(!isDatePickerOpen);
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>

        {/* Time section - using our custom time picker */}
        <div className="mt-2">
          <SimpleTimePicker value={time} onChange={setTime} use12Hours={true} />
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 top-[30%] md:top-[10%] z-40 flex justify-center items-center px-4 hidden md:flex" // Added hidden md:block
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-2 flex items-center space-x-2"
      >
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d1d1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #b1b1b1;
          }
        `}</style>

         {/* Location */}
         <div className="relative flex-1">
          <div
            className="flex items-center p-3 cursor-pointer group"
            onClick={() => {
              setActiveField(activeField === 'location' ? null : 'location');
              setIsPickupDateOpen(false);
              setIsReturnDateOpen(false);
            }}
          >
            <MapPin className="mr-3 text-gray-500 group-hover:text-black" size={20} />
            <input
              type="text"
              placeholder="Where"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent outline-none text-sm placeholder-gray-500 group-hover:placeholder-black"
              onClick={(e) => {
                e.stopPropagation();
                setActiveField('location');
                setIsPickupDateOpen(false);
                setIsReturnDateOpen(false);
              }}
            />
            <ChevronDown className="ml-2 text-gray-500 group-hover:text-black" size={16} />
          </div>
          <AnimatePresence>
            {activeField === 'location' && renderLocationDropdown()}
          </AnimatePresence>
        </div>

        {/* Pickup */}
        {renderDateTimeField(
          'pickup', 
          pickupDate, 
          pickupTime, 
          setPickupDate,
          setPickupTime,
          isPickupDateOpen, 
          setIsPickupDateOpen
        )}

        {/* Return */}
        {renderDateTimeField(
          'return', 
          returnDate, 
          returnTime, 
          setReturnDate,
          setReturnTime,
          isReturnDateOpen, 
          setIsReturnDateOpen
        )}

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          className="bg-[#8A7D55] text-white p-3 rounded-xl hover:bg-[#766b48] transition-colors flex items-center"
        >
          <Search size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}