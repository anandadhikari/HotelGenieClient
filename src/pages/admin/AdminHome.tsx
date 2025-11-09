import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaBed, FaCalendarCheck, FaUsers, FaTachometerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';

export default function AdminHome() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [adminName, setAdminName] = useState<string>('Admin');

  // Fetches the administrator's name to personalize the welcome message.
  useEffect(() => {
    const fetchAdminName = async () => {
      if (!isAuthenticated) {
        dispatch(logoutUser());
        return;
      }
      try {
        const api_url = import.meta.env.VITE_API_BASE_URL as string;
        const token = localStorage.getItem('authToken');
        if (!token) {
          dispatch(logoutUser());
          return;
        }
        const response = await fetch(`${api_url}/api/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAdminName(data.name || 'Admin');
        } else {
          console.error('Failed to fetch admin name:', response.statusText);
          dispatch(logoutUser());
        }
      } catch (err) {
        console.error('Failed to fetch admin name:', err);
        dispatch(logoutUser());
      }
    };
    fetchAdminName();
  }, [isAuthenticated, dispatch]);

  const sections = [
    { name: 'Manage Rooms', link: '/admin/rooms', description: 'Add, update, or delete room details.', icon: <FaBed className="text-4xl text-blue-600" /> },
    { name: 'Manage Bookings', link: '/admin/bookings', description: 'View and handle all bookings.', icon: <FaCalendarCheck className="text-4xl text-blue-600" /> },
    { name: 'Manage Clients', link: '/admin/clients', description: 'Manage client accounts and details.', icon: <FaUsers className="text-4xl text-blue-600" /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-4xl font-bold text-blue-700 flex items-center gap-3">
          <FaTachometerAlt /> Welcome, {adminName}
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link key={section.name} to={section.link} className="block">
            <motion.div whileHover={{ scale: 1.03, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }} whileTap={{ scale: 0.98 }} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:bg-blue-50 transition-all duration-300 cursor-pointer flex items-center space-x-6">
              {section.icon}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">{section.name}</h2>
                <p className="text-gray-600 text-base">{section.description}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </main>
  );
}
