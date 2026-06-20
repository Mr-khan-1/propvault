import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const CaptchaVerification = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setVerified(true);
    onVerify('verified-instant');
  };

  return (
    <div className="flex justify-center my-4">
      <button 
        type="button"
        onClick={handleVerify}
        className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg border transition-all w-full ${
          verified 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300'
        }`}
      >
        <ShieldCheck size={20} className={verified ? 'text-emerald-400' : 'text-slate-500'} />
        <span className="text-sm font-medium">
          {verified ? 'Verification Complete ✅' : 'Click to verify you are human'}
        </span>
      </button>
    </div>
  );
};

export default CaptchaVerification;
