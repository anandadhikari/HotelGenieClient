import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Room } from '@/lib/types';

interface RoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async (_, { getState }) => {
  const token = (getState() as any).auth.token;
  if (!token) {
    throw new Error('Please log in to view rooms.');
  }

  const api_url = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${api_url}/api/rooms`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rooms.');
  }

  const data: Room[] = await response.json();
  return data;
});

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action: PayloadAction<Room[]>) => {
        state.rooms = action.payload;
        state.loading = false;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      });
  },
});

export default roomsSlice.reducer;