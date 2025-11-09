import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '@/lib/types';

interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { getState }) => {
    const token = (getState() as any).auth.token;
    if (!token) {
      throw new Error('Please log in to view bookings.');
    }

    const api_url = import.meta.env.VITE_API_BASE_URL as string;
    const response = await fetch(`${api_url}/api/bookings`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bookings.');
    }

    const data: Booking[] = await response.json();
    return data;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.bookings = action.payload;
        state.loading = false;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      });
  },
});

export default bookingsSlice.reducer;