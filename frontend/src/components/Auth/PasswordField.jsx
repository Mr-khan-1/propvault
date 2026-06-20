import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

const PasswordField = ({ value, onChange, placeholder = "Password", showRequirements = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const requirements = [
    { id: 'length', text: 'Minimum 8 characters', regex: /.{8,}/ },
    { id: 'uppercase', text: 'At least 1 Uppercase letter (A-Z)', regex: /[A-Z]/ },
    { id: 'digit', text: 'At least 1 Digit (0-9)', regex: /[0-9]/ },
    { id: 'special', text: 'At least 1 Special character (!@#$%^&*)', regex: /[!@#$%^&*]/ }
  ];

  useEffect(() => {
    let score = 0;
    requirements.forEach(req => {
      if (req.regex.test(value)) score += 1;
    });
    setStrength(score);
  }, [value]);

  const strengthLabels = ['Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  return (
    <div className="w-full">
      <div className="relative">
        <Lock className="absolute left-3 top-2.5 text-slate-500" size={18} />
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 px-4 py-2 border border-slate-700 bg-slate-800/50 text-white rounded-md focus:ring-2 focus:ring-vault-gold/50 focus:border-transparent outline-none transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showRequirements && value.length > 0 && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-600">Password Strength:</span>
            <span className={`text-xs font-bold ${strengthColors[strength].replace('bg-', 'text-')}`}>
              {strengthLabels[strength]}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 flex overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 border-r border-white last:border-r-0 transition-all duration-300 ${i < strength ? strengthColors[strength] : 'bg-transparent'}`}
              ></div>
            ))}
          </div>

          <ul className="space-y-1">
            {requirements.map(req => {
              const isMet = req.regex.test(value);
              return (
                <li key={req.id} className="flex items-center text-xs">
                  {isMet ? (
                    <Check size={14} className="text-green-500 mr-2" />
                  ) : (
                    <X size={14} className="text-red-500 mr-2" />
                  )}
                  <span className={isMet ? 'text-green-700' : 'text-gray-500'}>{req.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
