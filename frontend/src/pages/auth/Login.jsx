import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import PasswordField from '../../components/Auth/PasswordField';
import ForgotPassword from '../../components/Auth/ForgotPassword';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', userType: 'user' });
  
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(form.email, form.password, form.userType);
      login(data.user, data.token);
      const paths = { admin: '/admin/dashboard', agent: '/agent/dashboard', user: '/user/dashboard' };
      navigate(paths[form.userType] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      if (authAPI.forgotPassword) {
        await authAPI.forgotPassword({ email, userType: form.userType });
      } else {
        alert("Forgot password feature is currently under development.");
        setShowForgotPwd(false);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="ultra-glass rounded-3xl p-8 card-shine">
          <div className="text-center mb-8 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-vault-gold to-amber-500 flex items-center justify-center shadow-lg shadow-vault-gold/20"
            >
              <LogIn className="text-vault-950" size={24} />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your PropVault account</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm relative z-10">{error}</motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Login As</label>
              <select className="w-full px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" value={form.userType}
                onChange={(e) => setForm({ ...form, userType: e.target.value })}>
                <option value="user">User / Buyer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input type="email" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="you@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            
            <div className="relative">
              <PasswordField 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                showRequirements={false}
              />
            </div>
            
            <div className="flex justify-end -mt-2">
              <button 
                type="button" 
                onClick={() => setShowForgotPwd(true)}
                className="text-sm text-vault-gold hover:underline"
              >
                Forgot Password?
              </button>
            </div>


            <button type="submit" disabled={loading} className="w-full py-2 bg-vault-gold text-vault-950 rounded-md font-semibold hover:bg-yellow-500 disabled:opacity-50 transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6 relative z-10">
            No account? <Link to="/auth/register" className="text-vault-gold hover:underline">Register with OTP</Link>
          </p>
        </div>
      </motion.div>

      <ForgotPassword 
        isOpen={showForgotPwd} 
        onClose={() => setShowForgotPwd(false)} 
        onSubmit={handleForgotPassword} 
      />
    </div>
  );
}
