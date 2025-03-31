'use client'
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { Select, MenuItem, SelectChangeEvent } from "@mui/material"
import { useState } from "react"
import { Dayjs } from "dayjs"

export default function DataReserve({onDateChange, onVenueChange} : {onDateChange:Function, onVenueChange:Function}) {
    const [reserveDate, setReserveDate] = useState<Dayjs|null>(null);
    const [venue, setVenue] = useState<string>('');
   
    const handleVenueChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setVenue(value);
        onVenueChange(value);
    };

    return (
        <div className="bg-slate-100 rounded-lg space-x-5 space-y-2
        w-fit px-10 py-5 flex flex-row justify-center">
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker 
                    className="bg-white" 
                    value={reserveDate} 
                    onChange={(value) => {
                        setReserveDate(value); 
                        onDateChange(value);
                    }}
                />
            </LocalizationProvider>
        </div>
    )
}