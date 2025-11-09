import { Link } from 'react-router-dom'
import { FaFrown, FaHome } from 'react-icons/fa'
import { motion } from 'framer-motion'

const CancelPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200"
      >
        <FaFrown className="text-red-500 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Payment Canceled
        </h1>
        <p className="text-gray-600 text-lg mb-2">Your booking was not completed.</p>
        <p className="text-gray-600 mb-6">
          If you have any questions, please contact our{' '}
          <a href="mailto:support@hotelgenie.com" className="text-blue-600 hover:underline font-medium">
            support team
          </a>.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
        >
          <FaHome /> Return to Home
        </Link>
      </motion.div>
    </div>
  )
}

export default CancelPage
