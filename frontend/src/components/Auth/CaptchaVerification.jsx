import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const CaptchaVerification = ({ onVerify }) => {
  // Use a test site key for development if real one is not provided in env
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  const handleCaptchaChange = (value) => {
    onVerify(value);
  };

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={handleCaptchaChange}
      />
    </div>
  );
};

export default CaptchaVerification;
