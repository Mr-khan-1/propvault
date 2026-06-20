import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashPath = user?.userType === 'admin' ? '/admin/dashboard'
    : user?.userType === 'agent' ? '/agent/dashboard'
    : user ? '/user/dashboard' : null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vault-gold to-amber-600 flex items-center justify-center">
              <span className="text-vault-950 font-bold text-sm">PV</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Prop<span className="text-vault-gold">Vault</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/properties" className="text-slate-300 hover:text-vault-gold transition-colors text-sm font-medium">
              Properties
            </Link>
            {dashPath && (
              <Link to={dashPath} className="text-slate-300 hover:text-vault-gold transition-colors text-sm font-medium flex items-center gap-1">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/auth/login" className="btn-outline text-sm py-2 px-4">Login</Link>
                <Link to="/auth/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-vault-gold capitalize">{user.userType}</p>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/properties" className="block py-2 text-slate-300" onClick={() => setOpen(false)}>Properties</Link>
              {dashPath && <Link to={dashPath} className="block py-2 text-slate-300" onClick={() => setOpen(false)}>Dashboard</Link>}
              {!user ? (
                <>
                  <Link to="/auth/login" className="block btn-outline text-center" onClick={() => setOpen(false)}>Login</Link>
                  <Link to="/auth/register" className="block btn-primary text-center" onClick={() => setOpen(false)}>Register</Link>
                </>
              ) : (
                <button onClick={handleLogout} className="w-full py-2 text-red-400">Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
