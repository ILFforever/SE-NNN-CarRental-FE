import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type BookState = {
  bookItems: BookingItem[]
}

const initialState: BookState = {bookItems: []}

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      // Check for duplicate bookings by date (same car on same date)
      const duplicateDateBookings = state.bookItems.filter(item => 
        item.bookDate === action.payload.bookDate && 
        item.car === action.payload.car
      );
      
      if (duplicateDateBookings.length > 0) {
        // Remove existing bookings for the same car on the same date
        state.bookItems = state.bookItems.filter(item => 
          !(item.bookDate === action.payload.bookDate && 
            item.car === action.payload.car)
        );
      }
      
      // Add the new booking
      state.bookItems.push(action.payload);
    },
    
    removeBooking: (state, action: PayloadAction<BookingItem>) => {
      state.bookItems = state.bookItems.filter(item => 
        !(item.nameLastname === action.payload.nameLastname && 
          item.tel === action.payload.tel &&
          item.car === action.payload.car &&
          item.bookDate === action.payload.bookDate)
      );
    },
    
    // New action to update a booking (useful for adding returnDate later)
    updateBooking: (state, action: PayloadAction<{
      original: BookingItem,
      updated: Partial<BookingItem>
    }>) => {
      const { original, updated } = action.payload;
      const index = state.bookItems.findIndex(item => 
        item.nameLastname === original.nameLastname &&
        item.tel === original.tel &&
        item.car === original.car &&
        item.bookDate === original.bookDate
      );
      
      if (index !== -1) {
        state.bookItems[index] = { ...state.bookItems[index], ...updated };
      }
    }
  }
});

export const { addBooking, removeBooking, updateBooking } = bookSlice.actions;
export default bookSlice.reducer;