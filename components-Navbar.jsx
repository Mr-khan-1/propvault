import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.userType === 'admin') return '/admin/dashboard';
    if (user.userType === 'agent') return '/agent/dashboard';
    return '/user/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-gradient-to-r from-blue-500 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🏠 RealEstate
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/properties" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Browse Properties
            </Link>

            {user && (
              <Link to={getDashboardLink()} className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{user.userType}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-indigo-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              to="/properties"
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Properties
            </Link>

            {user && (
              <Link
                to={getDashboardLink()}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {!user ? (
              <>
                <Link
                  to="/auth/login"
                  className="block px-4 py-2 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
