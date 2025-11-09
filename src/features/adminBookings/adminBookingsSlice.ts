import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '@/lib/types';

interface AdminBookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminBookingsState = {
  bookings: [],
  loading: false,
  error: null,
};

export const fetchAdminBookings = createAsyncThunk(
  'adminBookings/fetchAdminBookings',
  async (_, { getState }) => {
    const token = (getState() as any).auth.token;
    if (!token) {
      throw new Error('Please log in to view bookings.');
    }

    const api_url = import.meta.env.VITE_API_BASE_URL as string;
    const response = await fetch(`${api_url}/api/admin/bookings`, {
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

const adminBookingsSlice = createSlice({
  name: 'adminBookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.bookings = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      });
  },
});

export default adminBookingsSlice.reducer;