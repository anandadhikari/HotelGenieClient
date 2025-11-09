
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/features/auth/authSlice';
import { FaHome, FaRobot, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUser, FaTachometerAlt, FaHotel } from 'react-icons/fa';

export default function Nav({ isMobile }: { isMobile?: boolean }) {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const isAdmin = role === 'ROLE_ADMIN';

  const commonClasses = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium";
  const mobileClasses = "block";
  const desktopClasses = "inline-flex";

  const getLinkClass = (isActive: boolean) => {
    return `${commonClasses} ${isMobile ? mobileClasses : desktopClasses} ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
    }`;
  };

  return (
    <nav className={`flex ${isMobile ? 'flex-col space-y-1' : 'flex-row items-center space-x-4'}`}>
      <Link to="/" className={getLinkClass(false)}>
        <FaHome />
        <span>Home</span>
      </Link>
      <Link to="/recommendations" className={getLinkClass(false)}>
        <FaRobot />
        <span>Ask AI</span>
      </Link>

      {!isAuthenticated ? (
        <>
          <Link to="/login" className={getLinkClass(false)}>
            <FaSignInAlt />
            <span>Login</span>
          </Link>
          <Link to="/register" className={getLinkClass(false)}>
            <FaUserPlus />
            <span>Register</span>
          </Link>
        </>
      ) : (
        <>
          {isAdmin ? (
            <>
              <Link to="/admin" className={getLinkClass(false)}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </Link>
              <Link to="/account" className={getLinkClass(false)}>
                <FaUser />
                <span>Account</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/bookings" className={getLinkClass(false)}>
                <FaHotel />
                <span>Bookings</span>
              </Link>
              <Link to="/account" className={getLinkClass(false)}>
                <FaUser />
                <span>Account</span>
              </Link>
            </>
          )}
          <button
            onClick={() => dispatch(logoutUser())}
            className={`${commonClasses} ${isMobile ? mobileClasses : desktopClasses} text-red-600 hover:bg-red-100 hover:text-red-700`}
          >
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </>
      )}
    </nav>
  );
}
