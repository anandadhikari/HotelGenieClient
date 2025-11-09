import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '@/lib/types';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  loading: false,
  error: null,
};

export const fetchClients = createAsyncThunk('clients/fetchClients', async (_, { getState }) => {
  const token = (getState() as any).auth.token;
  if (!token) {
    throw new Error('Please log in to view clients.');
  }

  const api_url = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${api_url}/api/clients`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch clients.');
  }

  const data: Client[] = await response.json();
  return data;
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      });
  },
});

export default clientsSlice.reducer;