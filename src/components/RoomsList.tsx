import { Room } from '@/lib/types'
import { FaBed, FaStar, FaPaw, FaWifi, FaWater, FaSnowflake, FaDoorOpen, FaTachometerAlt, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'

type RoomsListProps = {
  rooms: Room[]
  onBook: (room: Room) => void
  role: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const RoomsList: React.FC<RoomsListProps> = ({ rooms, onBook, role }) => {
    console.log('Rendering BookingCard for rooms:', rooms);

  if (rooms.length === 0) {
    return <p>No rooms found.</p>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4"
    >
      {rooms.map((room, index) => (
        room && (
        <motion.div
          key={`${room.room.roomNr}-${index}`}
          variants={itemVariants}
          whileHover={{ scale: 1.03, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col group"
        >
          <div className="p-6 flex-grow">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3 font-serif">
              <FaBed className="text-blue-500 text-4xl" />
              <span>{room.room.roomType}</span>
            </h3>

            <dl className="text-base text-gray-600 mb-6 space-y-3">
              <div key={`${room.roomNr}-roomNr`} className="flex items-center gap-3">
                <dt className="text-gray-500"><FaDoorOpen /></dt>
                <dd><strong>Room Number:</strong> {room.room.roomNr}</dd>
              </div>
              <div key={`${room.roomNr}-floor`} className="flex items-center gap-3">
                <dt className="text-gray-500"><FaTachometerAlt /></dt>
                <dd><strong>Floor:</strong> {room.room.floor}</dd>
              </div>
              <div key={`${room.roomNr}-maxOccupancy`} className="flex items-center gap-3">
                <dt className="text-gray-500"><FaUser /></dt>
                <dd><strong>Max Occupancy:</strong> {room.room.maxOccupancy}</dd>
              </div>
              <div key={`${room.roomNr}-rating`} className="flex items-center gap-3">
                <dt className="text-yellow-500"><FaStar /></dt>
                <dd><strong>Rating:</strong> {(room.room.rating ?? 0).toFixed(1)}</dd>
              </div>
            </dl>

            <ul className="flex flex-wrap gap-3 text-sm text-gray-700 mb-6">
              {room.room.hasSeaView && (
                <li key={`${room.roomNr}-sea-view`} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <FaWater /> Sea View
                </li>
              )}
              {room.room.hasBalcony && (
                <li key={`${room.roomNr}-balcony`} className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  <FaDoorOpen /> Balcony
                </li>
              )}
              {room.room.hasWifi && (
                <li key={`${room.roomNr}-wifi`} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <FaWifi /> Wi-Fi
                </li>
              )}
              {room.room.hasAirConditioning && (
                <li key={`${room.roomNr}-ac`} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  <FaSnowflake /> Air Conditioning
                </li>
              )}
              {room.room.petFriendly && (
                <li key={`${room.roomNr}-pet`} className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <FaPaw /> Pet Friendly
                </li>
              )}
            </ul>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="text-2xl font-bold text-green-600">
                ₹{(room.room.basePrice ?? 0).toFixed(2)}
              </p>
              <span className="text-sm text-gray-500">/ Night</span>
            </div>
            {role !== 'ROLE_ADMIN' && (
              <motion.button
                onClick={() => onBook(room.room)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
              >
                <FaBed /> Book Now
              </motion.button>
            )}
          </div>
        </motion.div>
        )
      ))}
    </motion.div>
  );
};

export default RoomsList;