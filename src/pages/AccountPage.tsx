import { Client } from '@/lib/types';
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaSpinner, FaCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AccountPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetches the user's account details from the API on component mount.
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Please log in to view account details.');
        }

        const api_url = import.meta.env.VITE_API_BASE_URL as string;
        const response = await fetch(`${api_url}/api/account`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch account details.');
        }

        const data: Client = await response.json();
        setClient(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, []);

  // Validates user input and sends the updated account information to the server.
  const handleUpdateAccount = async () => {
    if (!client) return;

    setError(null);
    setSuccessMessage(null);
    setIsUpdating(true);

    if (!client.name.trim()) {
      setError('Name cannot be empty.');
      setIsUpdating(false);
      return;
    }
    if (client.phone && !/^\+?\d{7,15}$/.test(client.phone)) {
      setError('Please enter a valid phone number (7-15 digits).');
      setIsUpdating(false);
      return;
    }
    if (!client.paymentType) {
      setError('Payment type is required.');
      setIsUpdating(false);
      return;
    }

    try {
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const response = await fetch(`${api_url}/api/account`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(client),
      });

      if (response.ok) {
        setSuccessMessage('Account updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 w-full max-w-md" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold text-center text-blue-700 mb-6 flex items-center gap-3">
        <FaUser /> Account Details
      </motion.h2>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-xl p-8 shadow-lg w-full max-w-lg border border-gray-200">
        {client && (
          <>
            <div className="mb-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Name
              </label>
              <input id="name" type="text" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" />
            </div>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" /> Email
              </label>
              <input id="email" type="email" value={client.email} disabled className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaPhone className="text-blue-500" /> Phone
              </label>
              <input id="phone" type="text" value={client.phone || ''} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" placeholder="+1234567890" />
            </div>

            <div className="mb-6">
              <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaCreditCard className="text-blue-500" /> Payment Type
              </label>
              <select
                id="paymentType"
                value={client.paymentType || ''}
                onChange={(e) => setClient({ ...client, paymentType: e.target.value as 'CREDIT_CARD' | 'BANK_ACCOUNT' })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              >
                <option value="">Select Payment Type</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="BANK_ACCOUNT">Bank Account</option>
              </select>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {successMessage}</span>
              </motion.div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleUpdateAccount}
                disabled={isUpdating}
                className="bg-blue-600 text-white py-3 px-6 rounded-md flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FaSave />
                )} Update Account
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
