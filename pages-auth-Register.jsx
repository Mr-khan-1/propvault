import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Select type and email, Step 2: OTP verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [registerData, setRegisterData] = useState({
    userType: 'user',
    email: '',
    otp: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: '',
    license: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    
    if (!registerData.email) {
      setError('Please enter email address');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      await authAPI.sendOTP(registerData.email, registerData.userType);
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.name || !registerData.phone || !registerData.password || !registerData.otp) {
      setError('Please fill all fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (registerData.userType === 'agent' && (!registerData.company || !registerData.license)) {
      setError('Company and license are required for agents');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        userType: registerData.userType,
        ...(registerData.userType === 'agent' && {
          company: registerData.company,
          license: registerData.license
        })
      };

      const response = await authAPI.verifyOTP(
        registerData.email,
        registerData.otp,
        registerData.userType,
        userData
      );

      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to login or dashboard
      if (registerData.userType === 'agent') {
        navigate('/auth/login?message=Account created! Waiting for admin approval.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account 🚀</h1>
            <p className="text-gray-600">Join our community today</p>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Type and Email */}
          {!otpSent && (
            <form onSubmit={sendOTP} className="space-y-4">
              {/* User Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Register As</label>
                <select
                  name="userType"
                  value={registerData.userType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                >
                  <option value="user">User / Buyer</option>
                  <option value="agent">Real Estate Agent</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50"
              >
                {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
              </button>
            </form>
          )}

          {/* Step 2: OTP and Details */}
          {otpSent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                <input
                  type="text"
                  name="otp"
                  value={registerData.otp}
                  onChange={handleInputChange}
                  placeholder="000000"
                  maxLength="6"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800 text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">Check your email for OTP</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleInputChange}
                  placeholder="+92 300 1234567"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                />
              </div>

              {/* Agent Fields */}
              {registerData.userType === 'agent' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={registerData.company}
                      onChange={handleInputChange}
                      placeholder="Your Company"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      name="license"
                      value={registerData.license}
                      onChange={handleInputChange}
                      placeholder="License Number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-gray-800"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-all font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-300">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-indigo-600 font-bold hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
