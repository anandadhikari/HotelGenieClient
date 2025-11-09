import { useState, useEffect } from 'react';
import RoomsList from '@/components/RoomsList';
import DatePicker from '@/components/DatePicker';
import { fetchRooms, createBooking } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { FaSearch, FaExclamationCircle, FaCalendarAlt, FaHotel } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { validateDates } from '@/lib/dateUtils';

export default function HomePage() {
  const [startDate, setStartDate] = useState(''); // ✅ Blank default
  const [endDate, setEndDate] = useState('');     // ✅ Blank default
  const [minOccupancy, setMinOccupancy] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  useEffect(() => {
    window.addEventListener('focus', clearErrorsOnFocus);
    return () => window.removeEventListener('focus', clearErrorsOnFocus);
  }, []);

  const clearErrorsOnFocus = () => {
    setError(null);
    setBookingError(null);
  };

  const handleFetchRooms = async () => {
    // ✅ Check if user selected both dates
    if (!startDate || !endDate) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    // ✅ Validate date order and future range
    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      setError(dateError);
      return;
    }

    try {
      setLoading(true);
      setBookingError(null);
      setHasSearched(true);
      const accessToken = localStorage.getItem('authToken') || undefined;
      const fetchedRooms = await fetchRooms(startDate, endDate, minOccupancy, accessToken);
      setRooms(fetchedRooms);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (room: Room) => {
    if (!isAuthenticated) return setBookingError('Please log in to book a room.');
    if (role === 'ROLE_ADMIN') return setBookingError('Admins cannot book rooms here. Use the admin dashboard.');

    try {
      const accessToken = localStorage.getItem('authToken');
      if (!accessToken) return setBookingError('Please log in to book a room.');

      await createBooking(room, startDate, endDate, accessToken);
      handleFetchRooms();
    } catch (err: unknown) {
      if (err instanceof Error) setBookingError(err.message);
      else setBookingError('An unexpected error occurred.');
    }
  };

  return (
    <div className="container flex flex-col items-center mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center text-blue-700 mb-6 flex items-center gap-2"
      >
        <FaHotel /> Welcome to HotelGenie
      </motion.h1>
      <p className="text-center text-gray-600 mb-8 italic">
        Your perfect getaway is just a few clicks away.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center bg-white rounded-lg p-6 mb-8 shadow-md w-full max-w-2xl border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCalendarAlt /> Find Your Perfect Room
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end w-full">
          <DatePicker label="Check-in Date" value={startDate} onChange={setStartDate} />
          <DatePicker label="Check-out Date" value={endDate} onChange={setEndDate} />
          <div>
            <label htmlFor="minOccupancy" className="block mb-1 font-medium text-gray-700">
              Min Occupancy
            </label>
            <input
              id="minOccupancy"
              type="number"
              value={minOccupancy}
              onChange={(e) => setMinOccupancy(parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              min="1"
            />
          </div>
        </div>

        <button
          onClick={handleFetchRooms}
          disabled={loading}
          className="w-full md:w-auto mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 
                5.373 0 12h4zm2 5.291A7.962 7.962 0 
                014 12H0c0 3.042 1.135 5.824 3 
                7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <FaSearch />
          )}
          Search Rooms
        </button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 w-full"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </motion.div>
        )}
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-4">
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

        {hasSearched ? (
          rooms.length > 0 ? (
            <RoomsList rooms={rooms} onBook={handleBook} role={role} />
          ) : (
            <p className="text-center text-gray-500 text-lg mt-8">
              No rooms found for your search criteria.
            </p>
          )
        ) : (
          <p className="text-center text-gray-500 text-lg mt-8">
            Search for rooms using the form above!
          </p>
        )}
      </div>
    </div>
  );
}
