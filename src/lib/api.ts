import { Room } from './types'

const api_url = import.meta.env.VITE_API_BASE_URL as string

export const fetchRooms = async (startDate: string, endDate: string, minOccupancy: number, accessToken?: string) => {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${api_url}/api/main/available-rooms?startDate=${startDate}&endDate=${endDate}&minOccupancy=${minOccupancy}`,
    { headers }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in to see available rooms.');
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch available rooms.');
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch available rooms.');
    }
  }

  return response.json();
};

export const createBooking = async (room: Room, startDate: string, endDate: string, accessToken: string) => {
  const booking = { id: { startDate, roomNr: room.roomNr }, price: room.basePrice, room: { roomNr: room.roomNr }, endDate }
  const response = await fetch(`${api_url}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to create booking.')
  }

  const data = await response.json()
  const { checkoutLink } = data

  if (!checkoutLink || typeof checkoutLink !== 'string') {
    throw new Error('Invalid or missing checkout link from server.')
  }

  window.location.href = checkoutLink
}

export const deleteBooking = async (roomNr: string, startDate: string, accessToken: string) => {
  const response = await fetch(`${api_url}/api/bookings/${startDate}/${roomNr}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Failed to delete booking.')
}

export const fetchBookings = async (accessToken: string) => {
  try {
    const response = await fetch(`${api_url}/api/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch bookings')
    }

    const bookings = await response.json()
    return bookings
  } catch (error) {
    console.error(error)
    return []
  }
}
