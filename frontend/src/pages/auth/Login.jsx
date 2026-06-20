import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', userType: 'user' });

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to your PropVault account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Login As</label>
              <select className="input-field" value={form.userType}
                onChange={(e) => setForm({ ...form, userType: e.target.value })}>
                <option value="user">User / Buyer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <input type="email" className="input-field" placeholder="you@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            No account? <Link to="/auth/register" className="text-vault-gold hover:underline">Register with OTP</Link>
          </p>

          <div className="mt-6 p-3 rounded-xl bg-vault-gold/5 border border-vault-gold/20 text-xs text-slate-400">
            <p className="text-vault-gold font-medium mb-1">Demo Credentials</p>
            <p>Admin: admin@propvault.pk / Admin@123</p>
            <p>Agent: agent@propvault.pk / Agent@123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
