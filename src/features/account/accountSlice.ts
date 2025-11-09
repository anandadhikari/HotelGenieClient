import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '@/lib/types';

interface AccountState {
  client: Client | null;
  loading: boolean;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AccountState = {
  client: null,
  loading: true,
  isUpdating: false,
  error: null,
  successMessage: null,
};

export const fetchAccountDetails = createAsyncThunk(
  'account/fetchAccountDetails',
  async (_, { getState }) => {
    const token = (getState() as any).auth.token;
    if (!token) {
      throw new Error('Please log in to view account details.');
    }

    const api_url = import.meta.env.VITE_API_BASE_URL as string;
    const response = await fetch(`${api_url}/api/account`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch account details.');
    }

    const data: Client = await response.json();
    return data;
  }
);

export const updateAccountDetails = createAsyncThunk(
  'account/updateAccountDetails',
  async (client: Client, { getState }) => {
    const token = (getState() as any).auth.token;
    if (!token) {
      throw new Error('Please log in to update account details.');
    }

    const api_url = import.meta.env.VITE_API_BASE_URL as string;
    const response = await fetch(`${api_url}/api/account`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(client),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update account.');
    }

    return client;
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountDetails.fulfilled, (state, action: PayloadAction<Client>) => {
        state.client = action.payload;
        state.loading = false;
      })
      .addCase(fetchAccountDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      })
      .addCase(updateAccountDetails.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAccountDetails.fulfilled, (state, action: PayloadAction<Client>) => {
        state.client = action.payload;
        state.isUpdating = false;
        state.successMessage = 'Account updated successfully!';
      })
      .addCase(updateAccountDetails.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || 'An unexpected error occurred.';
      });
  },
});

export default accountSlice.reducer;