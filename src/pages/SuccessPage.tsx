import { Link, useSearchParams } from 'react-router-dom'
import { Suspense, useEffect, useState } from 'react'
import { FaCheckCircle, FaBed, FaCalendarAlt, FaDollarSign, FaSpinner, FaExclamationCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/dateUtils' // Import formatDate

interface SessionDetails {
  metadata: { roomNr: string; startDate: string; endDate: string }
  amount_total: number
}

const SuccessContent = () => {
  const [searchParams] = useSearchParams()
  const session_id = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session_id) {
      setError('No session ID found.')
      setLoading(false)
      return
    }

    const fetchSessionDetails = async () => {
      try {
        const api_url = import.meta.env.VITE_API_BASE_URL as string
        const response = await fetch(`${api_url}/api/stripe/get-session?session_id=${session_id}`)
        if (!response.ok) throw new Error('Failed to retrieve session details.')
        const data = await response.json()
        setSessionDetails(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
        setSessionDetails(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionDetails()
  }, [session_id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="text-5xl text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error || !sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md w-full" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Unable to retrieve booking details.'}</span>
        </motion.div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold">
          <FaBed /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200"
      >
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 text-lg mb-6">Thank you for your booking!</p>
        <div className="text-base text-gray-700 space-y-3 mb-6">
          <p className="flex items-center justify-center gap-2">
            <FaBed className="text-blue-600" />
            <strong>Room:</strong> {sessionDetails.metadata.roomNr}
          </p>
          <p className="flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <strong>Check-in:</strong> {formatDate(sessionDetails.metadata.startDate)}
          </p>
          <p className="flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <strong>Check-out:</strong> {formatDate(sessionDetails.metadata.endDate)}
          </p>
          <p className="flex items-center justify-center gap-2 text-green-700 font-semibold text-lg">
            <FaDollarSign className="text-green-600" />
            <strong>Total Paid:</strong> ${(sessionDetails.amount_total / 100).toFixed(2)}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-lg font-semibold"
        >
          <FaBed /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}

const SuccessPage = () => (
  <Suspense fallback={
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <FaSpinner className="text-5xl text-blue-600 animate-spin" />
    </div>
  }>
    <SuccessContent />
  </Suspense>
)

export default SuccessPage
