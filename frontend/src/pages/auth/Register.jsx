import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, User, Phone, Building2, FileBadge } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [form, setForm] = useState({
    userType: 'user', email: '', otp: '', name: '', phone: '',
    password: '', confirmPassword: '', company: '', license: '', city: ''
  });

  const update = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!form.email) return setError('Email required');
    setLoading(true);
    try {
      const { data } = await authAPI.sendOTP(form.email, form.userType);
      setOtpSent(true);
      setDevOtp(data.devOtp || '');
      if (data.devOtp) setForm((prev) => ({ ...prev, otp: data.devOtp }));
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password min 6 characters');
    if (form.userType === 'agent' && (!form.company || !form.license)) {
      return setError('Company and license required for agents');
    }

    setLoading(true);
    try {
      const userData = {
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, company: form.company,
        license: form.license, city: form.city
      };
      const { data } = await authAPI.verifyOTP(form.email, form.otp, form.userType, userData);
      login(data.user, data.token);
      if (form.userType === 'agent') {
        alert('Registration successful! Your account is pending admin approval.');
        navigate('/auth/login');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Create Account</h1>
            <p className="text-slate-400 mt-1">OTP verification required for all accounts</p>
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-8 bg-vault-gold' : 'w-4 bg-white/10'}`} />
              ))}
            </div>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

          {step === 1 ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Register As</label>
                <select name="userType" className="input-field" value={form.userType} onChange={update}>
                  <option value="user">User / Buyer</option>
                  <option value="agent">Real Estate Agent</option>
                </select>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="email" type="email" className="input-field pl-10" placeholder="Email address" required
                  value={form.email} onChange={update} />
              </div>
              {form.userType === 'agent' && (
                <p className="text-xs text-amber-400/80 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  Agent accounts require admin approval after OTP verification.
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={register} className="space-y-4">
              {otpSent && (
                <div className="text-center space-y-2">
                  <p className="text-emerald-400 text-sm">✓ OTP ready for {form.email}</p>
                  {devOtp && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <p className="text-amber-300 text-xs mb-1">Dev mode — Gmail not configured, use this OTP:</p>
                      <p className="font-mono text-2xl tracking-[0.4em] text-vault-gold font-bold">{devOtp}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="otp" className="input-field pl-10 tracking-[0.5em] text-center font-mono" placeholder="6-digit OTP" required
                  maxLength={6} value={form.otp} onChange={update} />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="name" className="input-field pl-10" placeholder="Full Name" required value={form.name} onChange={update} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input name="phone" className="input-field pl-10" placeholder="Phone Number" required value={form.phone} onChange={update} />
              </div>
              {form.userType === 'agent' && (
                <>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input name="company" className="input-field pl-10" placeholder="Company Name" required value={form.company} onChange={update} />
                  </div>
                  <div className="relative">
                    <FileBadge className="absolute left-3 top-3.5 text-slate-500" size={18} />
                    <input name="license" className="input-field pl-10" placeholder="License Number" required value={form.license} onChange={update} />
                  </div>
                  <input name="city" className="input-field" placeholder="City" value={form.city} onChange={update} />
                </>
              )}
              <input name="password" type="password" className="input-field" placeholder="Password" required value={form.password} onChange={update} />
              <input name="confirmPassword" type="password" className="input-field" placeholder="Confirm Password" required value={form.confirmPassword} onChange={update} />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating Account...' : 'Verify OTP & Register'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 text-sm hover:text-white">
                ← Back to email
              </button>
            </form>
          )}

          <p className="text-center text-slate-400 text-sm mt-6">
            Have an account? <Link to="/auth/login" className="text-vault-gold hover:underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
