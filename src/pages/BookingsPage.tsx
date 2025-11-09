import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { deleteBooking, fetchBookings } from '@/lib/api';
import { Booking } from '@/lib/types';
import BookingCard from '@/components/BookingCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import { FaCalendarCheck, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';

export default function BookingsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ roomNr: string; startDate: string } | null>(null);

  // Fetches all bookings for the authenticated user.
  const handleFetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to view your bookings.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch(logoutUser());
        return;
      }
      const fetchedBookings = await fetchBookings(token);
      setBookings(fetchedBookings);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    handleFetchBookings();
  }, [handleFetchBookings]);

  // Sets the state to show the confirmation modal before canceling a booking.
  const confirmCancelBooking = (roomNr: string, startDate: string) => {
    setBookingToCancel({ roomNr, startDate });
    setShowCancelModal(true);
  };

  // Deletes the specified booking, re-fetches the bookings list, and closes the modal.
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      dispatch(logoutUser());
      return;
    }

    try {
      await deleteBooking(bookingToCancel.roomNr, bookingToCancel.startDate, token);
      handleFetchBookings();
      setShowCancelModal(false);
      setBookingToCancel(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-blue-700 mb-8 flex items-center gap-3"
      >
        <FaCalendarCheck /> My Bookings
      </motion.h2>

      {loading ? (
        <div className="flex justify-center items-center h-64 w-full">
          <FaSpinner className="text-5xl text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 w-full max-w-2xl"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </motion.div>
          )}
          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center text-lg py-10">
              No bookings found. Start by searching for rooms on the <Link to="/" className="text-blue-600 hover:underline">Home Page</Link>.
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl"
            >
              {bookings.map((booking) => (
                <BookingCard
                  key={`${booking.roomNr}-${booking.startDate}`}
                  booking={booking}
                  onCancel={() => confirmCancelBooking(booking.roomNr, booking.startDate)}
                />
              ))}
            </motion.div>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        title="Confirm Cancellation"
        message={`Are you sure you want to cancel the booking for room ${bookingToCancel?.roomNr} on ${bookingToCancel?.startDate}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="No, Keep Booking"
      />
    </div>
  );
}
