import { Booking } from '@/lib/types';
import {
  FaBed, FaStar, FaPaw, FaWifi, FaWater, FaSnowflake, FaDoorOpen, FaTachometerAlt, FaUser, FaCalendarAlt, FaCalendarTimes
} from 'react-icons/fa';
import { motion } from 'framer-motion';

interface BookingCardProps {
  booking: Booking;
  onCancel: () => void;
}

const BookingCard = ({ booking, onCancel }: BookingCardProps) => {
  if (!booking || !booking.room) {
    console.error('BookingCard received invalid booking or room data:', booking);
    return null;
  }
  console.log('Rendering BookingCard for booking:', booking);
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group"
    >
      <div className="p-6 flex-grow">
        <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3 font-serif">
          <FaBed className="text-blue-500 text-4xl" />
          <span>{booking.room.roomType}</span>
        </h3>

        <div className="text-base text-gray-700 mb-4 space-y-2">
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <strong>Check-in:</strong> {formatDate(booking.startDate)}
          </p>
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <strong>Check-out:</strong> {formatDate(booking.endDate)}
          </p>
        </div>

        <dl className="text-base text-gray-600 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <dt className="text-gray-500"><FaDoorOpen /></dt>
            <dd><strong>Room Number:</strong> {booking.room.roomNr}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-gray-500"><FaTachometerAlt /></dt>
            <dd><strong>Floor:</strong> {booking.room.floor}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-gray-500"><FaUser /></dt>
            <dd><strong>Max Occupancy:</strong> {booking.room.maxOccupancy}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="text-yellow-500"><FaStar /></dt>
            <dd><strong>Rating:</strong> {(booking.room?.rating ?? 0).toFixed(1)}</dd>
          </div>
        </dl>

        <ul className="flex flex-wrap gap-3 text-sm text-gray-700 mb-6">
          {booking.room.hasSeaView && (
            <li className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <FaWater /> Sea View
            </li>
          )}
          {booking.room.hasBalcony && (
            <li className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
              <FaDoorOpen /> Balcony
            </li>
          )}
          {booking.room.hasWifi && (
            <li className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <FaWifi /> Wi-Fi
            </li>
          )}
          {booking.room.hasAirConditioning && (
            <li className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <FaSnowflake /> Air Conditioning
            </li>
          )}
          {booking.room.petFriendly && (
            <li className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <FaPaw /> Pet Friendly
            </li>
          )}
        </ul>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <p className="text-2xl font-bold text-green-600">
            ₹{((booking.price ?? 0) / 100).toFixed(2)}
          </p>
          <span className="text-sm text-gray-500">/ Night</span>
        </div>
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
        >
          <FaCalendarTimes /> Cancel Booking
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BookingCard;
