import { useCallback, useEffect, useState } from 'react';
import { FaBed, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function RoomsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState<Partial<Room>>({ available: true, rating: 0, basePrice: 0, floor: 0, maxOccupancy: 0 });
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  // Fetches all rooms from the API.
  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch(logoutUser());
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch(logoutUser());
        setLoading(false);
        return;
      }
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const response = await fetch(`${api_url}/api/rooms`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handles the submission of the form to create or update a room.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!form.roomNr || !form.floor || !form.maxOccupancy || !form.basePrice || !form.roomType) {
      setError('Room number, floor, max occupancy, base price, and room type are required.');
      setIsSubmitting(false);
      return;
    }
    if ((form.maxOccupancy as number) <= 0 || (form.basePrice as number) <= 0) {
      setError('Max occupancy and base price must be positive numbers.');
      setIsSubmitting(false);
      return;
    }

    try {
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch(logoutUser());
        setIsSubmitting(false);
        return;
      }
      const url = editingRoom ? `${api_url}/api/rooms/${editingRoom.roomNr}` : `${api_url}/api/rooms`;
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingRoom ? 'update' : 'add'} room`);
      }
      setForm({ available: true, rating: 0, basePrice: 0, floor: 0, maxOccupancy: 0 });
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populates the form with the data of the selected room for editing.
  const handleEdit = (room: Room) => {
    setForm(room);
    setEditingRoom(room);
  };

  // Opens the confirmation modal before deleting a room.
  const confirmDelete = (roomNr: string) => {
    setRoomToDelete(roomNr);
    setShowDeleteModal(true);
  };

  // Deletes the selected room after confirmation.
  const handleDelete = async () => {
    if (!roomToDelete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch(logoutUser());
        setIsSubmitting(false);
        return;
      }
      const response = await fetch(`${api_url}/api/rooms/${roomToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete room');
      }
      fetchRooms();
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <FaSpinner className="text-5xl text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-blue-700 mb-8 flex items-center gap-3">
        <FaBed /> Manage Rooms
      </motion.h1>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="roomNr" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input id="roomNr" name="roomNr" type="text" value={form.roomNr || ''} onChange={handleInputChange} placeholder="e.g., 101" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required disabled={!!editingRoom} />
          </div>
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
            <input id="floor" name="floor" type="number" value={form.floor || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required />
          </div>
          <div>
            <label htmlFor="maxOccupancy" className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy</label>
            <input id="maxOccupancy" name="maxOccupancy" type="number" value={form.maxOccupancy || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required />
          </div>
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
            <input id="basePrice" name="basePrice" type="number" step="0.01" value={form.basePrice || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required />
          </div>
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select id="roomType" name="roomType" value={form.roomType || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required>
              <option value="" disabled>
                Select Room Type
              </option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Family">Family</option>
            </select>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <input id="rating" name="rating" type="number" step="0.1" min="0" max="5" value={form.rating || ''} onChange={handleInputChange} placeholder="e.g., 4.5" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <input id="amenities" name="amenities" type="text" value={form.amenities || ''} onChange={handleInputChange} placeholder="e.g., Pool Access, Gym Access" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="preferredFor" className="block text-sm font-medium text-gray-700 mb-1">Preferred For</label>
            <input id="preferredFor" name="preferredFor" type="text" value={form.preferredFor || ''} onChange={handleInputChange} placeholder="e.g., Family, Honeymoon" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <label className="flex items-center text-gray-700">
              <input name="available" type="checkbox" checked={form.available ?? true} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Available</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input name="hasSeaView" type="checkbox" checked={form.hasSeaView || false} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Sea View</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input name="hasBalcony" type="checkbox" checked={form.hasBalcony || false} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Balcony</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input name="hasWifi" type="checkbox" checked={form.hasWifi || false} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Wifi</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input name="hasAirConditioning" type="checkbox" checked={form.hasAirConditioning || false} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Air Conditioning</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input name="petFriendly" type="checkbox" checked={form.petFriendly || false} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
              <span className="ml-2 text-sm font-medium">Pet-Friendly</span>
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white py-3 px-6 rounded-md flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <FaSpinner className="animate-spin" />
              ) : editingRoom ? (
                <FaSave />
              ) : (
                <FaPlus />
              )}
              {isSubmitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
            </button>
            {editingRoom && (
              <button type="button" onClick={() => { setEditingRoom(null); setForm({ available: true, rating: 0, basePrice: 0, floor: 0, maxOccupancy: 0 }) }} className="bg-gray-500 text-white py-3 px-6 rounded-md flex items-center gap-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold">
                <FaTimes /> Cancel
              </button>
            )}
          </div>
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Rooms</h2>
        {rooms.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600 text-center text-lg py-10">
            No rooms found.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <motion.div key={room.roomNr} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaBed className="text-blue-600" /> Room #{room.roomNr} ({room.roomType})
                  </h3>
                  <p className="text-gray-700 text-sm mb-1">Floor: {room.floor} | Max Occupancy: {room.maxOccupancy}</p>
                  <p className="text-gray-700 text-sm mb-1">Base Price: ${room.basePrice.toFixed(2)} | Rating: {room.rating || 'N/A'}</p>
                  <p className="text-gray-700 text-sm mb-1">Status: {room.available ? 'Available' : 'Occupied'}</p>
                  <p className="text-gray-700 text-sm mb-2">Amenities: {room.amenities || 'None'}</p>
                  <p className="text-gray-700 text-sm mb-2">Preferred For: {room.preferredFor || 'General'}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {room.hasSeaView && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Sea View</span>}
                    {room.hasBalcony && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Balcony</span>}
                    {room.hasWifi && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Wifi</span>}
                    {room.hasAirConditioning && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">A/C</span>}
                    {room.petFriendly && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pet-Friendly</span>}
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={() => handleEdit(room)} className="bg-yellow-500 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-yellow-600 transition-all duration-200 text-sm font-semibold">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => confirmDelete(room.roomNr)} className="bg-red-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-red-700 transition-all duration-200 text-sm font-semibold">
                    <FaTrash /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Room Deletion"
        message={`Are you sure you want to delete room ${roomToDelete}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Keep Room"
      />
    </main>
  );
}
