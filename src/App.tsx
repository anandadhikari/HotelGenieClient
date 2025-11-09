import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { validateToken } from './features/auth/authSlice';
import Header from '@/components/Header';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import BookingsPage from '@/pages/BookingsPage';
import CancelPage from '@/pages/CancelPage';
import SuccessPage from '@/pages/SuccessPage';
import AccountPage from '@/pages/AccountPage';
import AdminPage from '@/pages/admin/AdminHome';
import AdminRoomsPage from '@/pages/admin/RoomsPage';
import AdminClientsPage from '@/pages/admin/ClientsPage';
import AdminBookingsPage from '@/pages/admin/BookingsPage';
import RecommendationsPage from '@/pages/RecommendationsPage';

function AppContent() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/clients" element={<AdminClientsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <AppContent />;
}
