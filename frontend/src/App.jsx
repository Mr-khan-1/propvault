import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PropertyListing from './pages/properties/PropertyListing';
import PropertyDetail from './pages/properties/PropertyDetail';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AgentDashboard from './pages/dashboard/AgentDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <Loader fullScreen text="Initializing PropVault" />;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col relative">
          <AnimatedBackground />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<PropertyListing />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/auth/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/auth/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/agent/dashboard" element={<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>} />
              <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
