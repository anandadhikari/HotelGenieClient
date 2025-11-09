import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUsers, FaComment, FaRobot, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import DatePicker from '@/components/DatePicker';
import { validateDates } from '@/lib/dateUtils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';
import RoomsList from '@/components/RoomsList';
import { createBooking } from '@/lib/api';
import { Room } from '@/lib/types';

type RecommendationResponse = {
  message: string;
  rooms: Room[];
  aiGenerated: boolean;
  provider: string;
};

const RecommendationsPage = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minOccupancy, setMinOccupancy] = useState(1);
  const [preferences, setPreferences] = useState('');
  const [recommendedRooms, setRecommendedRooms] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null); // New bookingError state
  const [loading, setLoading] = useState<boolean>(false); // New loading state

  // Fetches AI-powered room recommendations based on user-defined criteria.
  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendedRooms(null);

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      setError(dateError);
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError('Please log in to get recommendations.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      dispatch(logoutUser());
      setLoading(false);
      return;
    }

    try {
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const url = `${api_url}/api/recommendations?startDate=${startDate}&endDate=${endDate}&minOccupancy=${minOccupancy}&preferences=${encodeURIComponent(preferences)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch recommendations.');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch recommendations.');
        }
      }

      const data: RecommendationResponse = await response.json();
      setRecommendedRooms(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Creates a new booking and re-fetches recommendations to update room availability.
  const handleBook = async (room: Room) => {
    if (!isAuthenticated) return setBookingError('Please log in to book a room.');
    if (role === 'ROLE_ADMIN') {
      return setBookingError('Admins cannot book rooms here. Use the admin dashboard.');
    }
    try {
      const accessToken = localStorage.getItem('authToken');
      if (!accessToken) return setBookingError('Please log in to book a room.');
      await createBooking(room, startDate, endDate, accessToken);
      // After booking, re-fetch recommendations to update availability
      handleRecommend(new Event('submit') as any);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBookingError(err.message);
      } else {
        setBookingError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="container flex flex-col items-center mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center text-blue-700 mb-6 flex items-center gap-3">
        <FaRobot /> Ask AI for Recommendations
      </motion.h1>
      <p className="text-center text-gray-600 mb-8 italic">Let our AI find the perfect room for your stay!</p>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-xl p-8 shadow-lg w-full max-w-lg border border-gray-200">
        <form onSubmit={handleRecommend} className="flex flex-col gap-6">
          <DatePicker label="Check-in Date" value={startDate} onChange={setStartDate} />
          <DatePicker label="Check-out Date" value={endDate} onChange={setEndDate} />
          <div>
            <label htmlFor="minOccupancy" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaUsers className="text-blue-500" /> Min Occupancy
            </label>
            <input
              type="number"
              id="minOccupancy"
              value={minOccupancy}
              onChange={(e) => setMinOccupancy(parseInt(e.target.value, 10))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              min="1"
            />
          </div>
          <div>
            <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaComment className="text-blue-500" /> Preferences
            </label>
            <input
              type="text"
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., ocean view, near pool"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaRobot />
            )} Recommend Rooms
          </button>
        </form>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </motion.div>
        )}
      </motion.div>

      {recommendedRooms && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-8 w-full max-w-7xl mx-auto px-4">
          {bookingError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md shadow-md relative z-10"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <FaExclamationCircle className="h-6 w-6 text-red-500 mr-4" />
                </div>
                <div>
                  <p className="font-bold">Booking Error</p>
                  <p className="text-sm">{bookingError}</p>
                </div>
              </div>
            </motion.div>
          )}
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Recommended Rooms</h2>
          {recommendedRooms.message && (
            <p className="text-center text-gray-600 mb-4 italic">{recommendedRooms.message}</p>
          )}
          {recommendedRooms.rooms.length > 0 ? (
            <RoomsList rooms={recommendedRooms.rooms} onBook={handleBook} role={role} />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 text-center text-lg py-10"
            >
              No recommendations found for your preferences.
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RecommendationsPage;
