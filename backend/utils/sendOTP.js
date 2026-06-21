const { Resend } = require('resend');

// Only instantiate Resend if the API key is provided
const apiKey = (process.env.RESEND_API_KEY || '').trim();
const resend = apiKey ? new Resend(apiKey) : null;

const getMailConfig = () => {
  const configured = Boolean(apiKey && apiKey.startsWith('re_'));
  
  if (!configured) {
    console.error('❌ Resend API Key not configured. Server is running, but emails will fail until you add RESEND_API_KEY to your Railway variables.');
  }

  return { configured };
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendMailSafe = async (mailOptions) => {
  const { configured } = getMailConfig();
  if (!configured || !resend) {
    throw new Error('Email service not configured — missing RESEND_API_KEY');
  }
  
  try {
    const { data, error } = await resend.emails.send(mailOptions);
    if (error) {
      throw new Error(error.message);
    }
    console.log('✅ Email sent to:', mailOptions.to, '| ID:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

const getSenderEmail = () => {
  // Resend requires a verified domain. 
  // Free accounts use 'onboarding@resend.dev' and can only send to their registered email.
  return process.env.EMAIL_FROM || 'onboarding@resend.dev';
};

const sendOTP = async (email, otp, userType) => {
  await sendMailSafe({
    from: `PropVault <${getSenderEmail()}>`,
    to: email,
    subject: `PropVault — Your ${userType} verification code`,
    html: `
      <div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;padding:32px;border-radius:16px;">
        <h1 style="color:#f59e0b;margin:0 0 8px;font-size:24px;">PropVault</h1>
        <p style="color:#94a3b8;margin:0 0 24px;">Secure property platform</p>
        <div style="background:#1e293b;border-radius:12px;padding:24px;border:1px solid #334155;">
          <p style="color:#e2e8f0;margin:0 0 16px;">Your OTP for <strong>${userType}</strong> registration:</p>
          <div style="background:#f59e0b;color:#0f172a;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;border-radius:8px;">${otp}</div>
          <p style="color:#64748b;font-size:12px;margin:16px 0 0;">Valid for 10 minutes. Do not share this code.</p>
        </div>
      </div>`
  });
};

const sendWelcomeEmail = async (email, name, userType) => {
  await sendMailSafe({
    from: `PropVault <${getSenderEmail()}>`,
    to: email,
    subject: 'Welcome to PropVault',
    html: `<p>Hi ${name}, your ${userType} account on PropVault is ready. Start exploring premium properties today.</p>`
  });
};

const sendAgentApprovalEmail = async (email, name) => {
  await sendMailSafe({
    from: `PropVault <${getSenderEmail()}>`,
    to: email,
    subject: 'Agent Account Approved — PropVault',
    html: `<p>Hi ${name}, your agent account has been approved. You can now login and list properties.</p>`
  });
};

module.exports = {
  generateOTP,
  sendOTP,
  sendWelcomeEmail,
  sendAgentApprovalEmail,
  getMailConfig
};
