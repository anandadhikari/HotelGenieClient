import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import accountReducer from '@/features/account/accountSlice';
import bookingsReducer from '@/features/bookings/bookingsSlice';
import roomsReducer from '@/features/rooms/roomsSlice';
import clientsReducer from '@/features/clients/clientsSlice';
import adminBookingsReducer from '@/features/adminBookings/adminBookingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    bookings: bookingsReducer,
    rooms: roomsReducer,
    clients: clientsReducer,
    adminBookings: adminBookingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
