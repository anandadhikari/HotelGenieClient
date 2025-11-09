export type Room = {
  room: any
  roomNr: string
  floor: number
  maxOccupancy: number
  roomType: string
  hasSeaView: boolean
  hasBalcony: boolean
  hasWifi: boolean
  hasAirConditioning: boolean
  petFriendly: boolean
  amenities: string
  rating: number
  basePrice: number
  preferredFor: string
  available: boolean
}

export type Booking = {
  startDate: string
  endDate: string
  roomNr: string
  price: number
  clientEmail: string
  room: Room
}

export type User = {
  email: string
  role: string
}

export type Client = {
  name: string
  email: string
  phone: string
  paymentType: 'CREDIT_CARD' | 'BANK_ACCOUNT'
}

export type CreditCard = {
  holdername: string
  cardnumber: string
  type: string
  paymentType: 'CREDIT_CARD' | 'BANK_ACCOUNT'
}

export type BankAccount = {
  bank: string
  accountnumber: string
  routingnumber: string
  paymentType: 'CREDIT_CARD' | 'BANK_ACCOUNT'
}


