import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// Helper function to check if a token is expired
const isTokenExpired = (token: string) => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return exp * 1000 < Date.now();
  } catch (error) {
    console.error('Failed to decode token:', error);
    return true;
  }
};

// Define the shape of the authentication state
interface AuthState {
  isAuthenticated: boolean;
  role: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state for the auth slice
const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  loading: true,
  error: null,
};

// Async thunk for logging out the user
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { dispatch }) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const api_url = import.meta.env.VITE_API_BASE_URL;
      await fetch(`${api_url}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  dispatch(logout());
});

// Async thunk for validating the user's token
export const validateToken = createAsyncThunk('auth/validateToken', async (_, { dispatch }) => {
  const token = localStorage.getItem('authToken');
  const storedRole = localStorage.getItem('authRole');

  if (token && !isTokenExpired(token)) {
    try {
      const api_url = import.meta.env.VITE_API_BASE_URL;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${api_url}/api/auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(id); // Clear the timeout if the fetch completes within the time

      if (response.ok) {
        const data = await response.json();
        return data.role || storedRole;
      } else {
        await dispatch(logoutUser());
        throw new Error('Token validation failed');
      }
    } catch (error) {
      await dispatch(logoutUser());
      throw new Error('Failed to validate token');
    }
  } else {
    await dispatch(logoutUser());
    throw new Error('No token or token expired');
  }
});

// Async thunk for logging in the user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ token, role }: { token: string; role: string }, { dispatch }) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authRole', role);
    dispatch(login({ token, role }));
    return { role };
  }
);

// Create the authentication slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; role: string }>) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authRole');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action: PayloadAction<string>) => {
        state.isAuthenticated = true;
        state.role = action.payload;
        state.loading = false;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.role = null;
        state.loading = false;
        state.error = action.error.message || 'Failed to validate token';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.role = null;
        state.error = null;
      });
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;