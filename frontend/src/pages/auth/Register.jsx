import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Phone, Building2, FileBadge, Shield, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import PasswordField from '../../components/Auth/PasswordField';
import CaptchaVerification from '../../components/Auth/CaptchaVerification';
import OTPInput from '../../components/Auth/OTPInput';

const steps = ['Account Type', 'Verify & Register'];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const [form, setForm] = useState({
    userType: 'user', email: '', otp: '', name: '', phone: '',
    password: '', confirmPassword: '', company: '', license: '', city: ''
  });

  const update = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const sendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!form.email) return setError('Email required');
    if (!captchaVerified) return setError('Please verify you are not a robot');
    
    setLoading(true);
    try {
      const { data } = await authAPI.sendOTP(form.email, form.userType);
      setOtpSent(true);
      setDevOtp(data.devOtp || '');
      if (data.devOtp) setForm((prev) => ({ ...prev, otp: data.devOtp }));
      if (!data.emailSent && !data.devOtp) {
        setError(data.message || 'Email could not be sent. Check backend console or Gmail settings.');
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    // Basic frontend check, backend handles exact regex
    if (form.password.length < 8) return setError('Password min 8 characters');
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

      if (form.userType === 'agent') {
        setStep(3);
      } else {
        login(data.user, data.token);
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (code) => {
    setForm(prev => ({ ...prev, otp: code }));
    // Note: User will still need to fill out their profile and password before submitting
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="ultra-glass rounded-3xl p-8 card-shine">
          <AnimatePresence mode="wait">
            {step < 3 ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-8 relative z-10">
                  <h1 className="font-display text-3xl font-bold">Create Account</h1>
                  <p className="text-slate-400 mt-1">Secure OTP verification for all accounts</p>
                  <div className="flex justify-center items-center gap-3 mt-5">
                    {steps.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${step > i ? 'bg-vault-gold text-vault-950' : step === i + 1 ? 'bg-vault-gold/20 text-vault-gold border border-vault-gold/40' : 'bg-white/5 text-slate-500'}`}>
                          {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs hidden sm:inline ${step === i + 1 ? 'text-vault-gold' : 'text-slate-500'}`}>{label}</span>
                        {i < steps.length - 1 && <div className={`w-8 h-0.5 rounded ${step > i + 1 ? 'bg-vault-gold' : 'bg-white/10'}`} />}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm relative z-10">{error}</motion.div>
                )}

                {step === 1 ? (
                  <motion.form onSubmit={sendOTP} className="space-y-4 relative z-10" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Register As</label>
                      <select name="userType" className="w-full px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" value={form.userType} onChange={update}>
                        <option value="user">User / Buyer</option>
                        <option value="agent">Real Estate Agent</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-slate-500" size={18} />
                      <input name="email" type="email" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="Email address" required
                        value={form.email} onChange={update} />
                    </div>
                    
                    <CaptchaVerification onVerify={(val) => setCaptchaVerified(!!val)} />

                    {form.userType === 'agent' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"
                      >
                        <Shield className="text-amber-400 shrink-0 mt-0.5" size={18} />
                        <div className="text-xs text-amber-200/90 leading-relaxed">
                          <p className="font-semibold text-amber-300 mb-1">Admin Approval Required</p>
                          After OTP verification, your agent profile goes to the admin queue. You'll get access once approved.
                        </div>
                      </motion.div>
                    )}
                    <button type="submit" disabled={loading || !captchaVerified} className="w-full py-2 bg-vault-gold text-vault-950 rounded-md font-semibold hover:bg-yellow-500 disabled:opacity-50 transition-colors">
                      {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form onSubmit={register} className="space-y-4 relative z-10" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
                      <OTPInput 
                        email={form.email} 
                        onVerify={handleVerifyOTP} 
                        onResend={sendOTP} 
                      />
                    </div>
                    
                    {devOtp && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center mb-4">
                        <p className="text-amber-300 text-xs mb-1">Dev fallback OTP:</p>
                        <p className="font-mono text-2xl tracking-[0.4em] text-vault-gold font-bold">{devOtp}</p>
                      </div>
                    )}
                    
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 text-slate-500" size={18} />
                      <input name="name" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="Full Name" required value={form.name} onChange={update} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 text-slate-500" size={18} />
                      <input name="phone" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="Phone Number" required value={form.phone} onChange={update} />
                    </div>
                    {form.userType === 'agent' && (
                      <>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 text-slate-500" size={18} />
                          <input name="company" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="Company Name" required value={form.company} onChange={update} />
                        </div>
                        <div className="relative">
                          <FileBadge className="absolute left-3 top-2.5 text-slate-500" size={18} />
                          <input name="license" className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="License Number" required value={form.license} onChange={update} />
                        </div>
                        <input name="city" className="w-full px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none" placeholder="City" value={form.city} onChange={update} />
                      </>
                    )}
                    
                    <div className="pt-2">
                      <PasswordField 
                        value={form.password} 
                        onChange={(e) => setForm({ ...form, password: e.target.value })} 
                        placeholder="Create Password"
                      />
                    </div>
                    <input 
                      name="confirmPassword" 
                      type="password" 
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md outline-none -mt-2" 
                      placeholder="Confirm Password" 
                      required 
                      value={form.confirmPassword} 
                      onChange={update} 
                    />
                    
                    <button type="submit" disabled={loading || form.otp.length < 6} className="w-full py-2 bg-vault-gold text-vault-950 rounded-md font-semibold hover:bg-yellow-500 disabled:opacity-50 transition-colors mt-4">
                      {loading ? 'Creating Account...' : 'Finish Registration'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 text-sm hover:text-white transition-colors">
                      ← Back to email
                    </button>
                  </motion.form>
                )}

                <p className="text-center text-slate-400 text-sm mt-6 relative z-10">
                  Have an account? <Link to="/auth/login" className="text-vault-gold hover:underline">Login</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 relative z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-vault-gold/10 border border-vault-gold/30 flex items-center justify-center"
                >
                  <Clock className="text-vault-gold" size={36} />
                </motion.div>
                <h2 className="font-display text-2xl font-bold mb-2">Application Submitted</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                  Your agent account for <span className="text-white">{form.company}</span> is now in the admin approval queue. You'll receive an email once approved.
                </p>
                <div className="flex flex-col gap-2 text-left max-w-xs mx-auto mb-8">
                  {['OTP verified', 'Profile submitted', 'Awaiting admin review'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <CheckCircle2 size={16} className={i < 2 ? 'text-emerald-400' : 'text-amber-400 animate-pulse-soft'} />
                      {item}
                    </motion.div>
                  ))}
                </div>
                <Link to="/auth/login" className="btn-primary inline-flex items-center gap-2">
                  Go to Login <ArrowRight size={16} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
