import { useCallback, useEffect, useState } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Client } from '@/lib/types';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function ClientsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Partial<Client>>({});
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Fetches all clients from the API.
  const fetchClients = useCallback(async () => {
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
      const response = await fetch(`${api_url}/api/clients`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handles the submission of the form to create or update a client.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!form.email || !form.name) {
      setError('Email and name are required.');
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) {
      setError('Please enter a valid phone number (7-15 digits).');
      setIsSubmitting(false);
      return;
    }
    if (!editingClient && (!(form as any).password || (form as any).password.length < 6)) {
      setError('Password is required and must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    const clientData = { ...(form as any), paymentType: form.paymentType || null };

    try {
      const api_url = import.meta.env.VITE_API_BASE_URL as string;
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch(logoutUser());
        setIsSubmitting(false);
        return;
      }
      const url = editingClient ? `${api_url}/api/clients/${editingClient.email}` : `${api_url}/api/clients`;
      const method = editingClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingClient ? 'update' : 'add'} client`);
      }
      setSuccessMessage(`Client ${editingClient ? 'updated' : 'added'} successfully!`);
      setForm({});
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populates the form with the data of the selected client for editing.
  const handleEdit = (client: Client) => {
    setForm(client);
    setEditingClient(client);
  };

  // Opens the confirmation modal before deleting a client.
  const confirmDelete = (email: string) => {
    setClientToDelete(email);
    setShowDeleteModal(true);
  };

  // Deletes the selected client after confirmation.
  const handleDelete = async () => {
    if (!clientToDelete) return;

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
      const response = await fetch(`${api_url}/api/clients/${clientToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete client');
      }
      setSuccessMessage('Client deleted successfully!');
      fetchClients();
      setShowDeleteModal(false);
      setClientToDelete(null);
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
        <FaUsers /> Manage Clients
      </motion.h1>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" value={form.email || ''} onChange={handleInputChange} placeholder="client@example.com" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required disabled={!!editingClient} />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input id="name" name="name" type="text" value={form.name || ''} onChange={handleInputChange} placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required />
          </div>
          {!editingClient && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="password" name="password" type="password" value={(form as any).password || ''} onChange={handleInputChange} placeholder="Enter password" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" required />
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input id="phone" name="phone" type="text" value={form.phone || ''} onChange={handleInputChange} placeholder="+1234567890" className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out" />
          </div>
          <div>
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
            <select id="paymentType" name="paymentType" value={form.paymentType || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out">
              <option value="">Select Payment Type (Optional)</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="BANK_ACCOUNT">Bank Account</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white py-3 px-6 rounded-md flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <FaSpinner className="animate-spin" />
              ) : editingClient ? (
                <FaSave />
              ) : (
                <FaPlus />
              )}
              {isSubmitting ? 'Saving...' : editingClient ? 'Update Client' : 'Add Client'}
            </button>
            {editingClient && (
              <button type="button" onClick={() => { setEditingClient(null); setForm({}) }} className="bg-gray-500 text-white py-3 px-6 rounded-md flex items-center gap-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold">
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
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {successMessage}</span>
          </motion.div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Clients</h2>
        {clients.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600 text-center text-lg py-10">
            No clients found.
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <motion.div key={client.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaUser className="text-blue-600" /> {client.name} ({client.email})
                  </h3>
                  <p className="text-gray-700 text-sm mb-1">Phone: {client.phone || 'N/A'}</p>
                  <p className="text-gray-700 text-sm mb-2">Payment Type: {client.paymentType || 'Not Set'}</p>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button onClick={() => handleEdit(client)} className="bg-yellow-500 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-yellow-600 transition-all duration-200 text-sm font-semibold">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => confirmDelete(client.email)} className="bg-red-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-red-700 transition-all duration-200 text-sm font-semibold">
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
        title="Confirm Client Deletion"
        message={`Are you sure you want to delete client ${clientToDelete}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Keep Client"
      />
    </main>
  );
}
