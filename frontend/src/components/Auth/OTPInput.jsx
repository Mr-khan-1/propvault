import React, { useState, useEffect } from 'react';

const OTPInput = ({ email, onVerify, onResend }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    
    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setMessage('');
    try {
      await onResend();
      setTimer(60);
      setMessage('Code sent successfully!');
    } catch (error) {
      setMessage('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <p className="text-sm text-slate-400 text-center">
        Enter the 6-digit code sent to <br/><span className="font-medium text-white">{email}</span>
      </p>

      <div className="flex justify-center space-x-3">
        {otp.map((data, index) => (
          <input
            className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-vault-gold/50 focus:border-transparent outline-none transition-all"
            type="text"
            name="otp"
            maxLength="1"
            key={index}
            value={data}
            onChange={e => handleChange(e.target, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={e => e.target.select()}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleVerify}
        disabled={otp.join('').length < 6}
        className="w-full py-3 bg-vault-gold text-vault-950 rounded-xl font-semibold hover:bg-yellow-500 disabled:opacity-50 transition-colors"
      >
        Verify & Proceed
      </button>

      <div className="text-sm text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || isResending}
          className={`font-medium transition-colors ${timer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-vault-gold hover:underline'}`}
        >
          {isResending ? 'Sending...' : 'Resend OTP'}
        </button>
        {timer > 0 && <span className="text-slate-500 ml-2">(in {timer}s)</span>}
        {message && <p className="text-emerald-400 mt-2 text-xs">{message}</p>}
      </div>
    </div>
  );
};

export default OTPInput;
