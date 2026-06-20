import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerification from './pages/auth/OTPVerification';
import PropertyListing from './pages/properties/PropertyListing';
import PropertyDetail from './pages/properties/PropertyDetail';

// Dashboards
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AgentDashboard from './pages/dashboard/AgentDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';

import NotFound from './pages/NotFound';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser: login, logout }}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar user={user} />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<PropertyListing />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              
              {/* Auth Routes */}
              {!user && (
                <>
                  <Route path="/auth/login" element={<Login setUser={login} />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/verify-otp" element={<OTPVerification />} />
                </>
              )}

              {/* Protected Routes */}
              {user && (
                <>
                  {user.userType === 'admin' && (
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  )}
                  {user.userType === 'agent' && (
                    <Route path="/agent/dashboard" element={<AgentDashboard />} />
                  )}
                  {user.userType === 'user' && (
                    <Route path="/user/dashboard" element={<UserDashboard />} />
                  )}
                </>
              )}

              {/* Redirect authenticated users away from auth pages */}
              {user && (
                <>
                  <Route path="/auth/*" element={<Navigate to="/" replace />} />
                </>
              )}

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
