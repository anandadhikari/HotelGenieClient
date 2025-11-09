import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'

describe('Header', () => {
  it('renders the logo and title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    expect(screen.getByAltText('HotelGenie Logo')).toBeInTheDocument()
    expect(screen.getByText('HotelGenie')).toBeInTheDocument()
  })

  it('toggles the mobile menu on button click', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    // Initially, the mobile nav should not be visible
    expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument()

    // Find the mobile menu button and click it
    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // Now the mobile nav should be visible
    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
  })
})
