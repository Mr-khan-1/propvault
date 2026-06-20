const nodemailer = require('nodemailer');

const getMailConfig = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER)?.trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD)?.replace(/\s/g, '').trim();
  return { user, pass, configured: Boolean(user && pass && pass.length >= 16) };
};

const createTransporter = () => {
  const { user, pass, configured } = getMailConfig();
  if (!configured) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

let transporter = createTransporter();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendMailSafe = async (mailOptions) => {
  if (!transporter) {
    throw new Error('Email service not configured');
  }
  return transporter.sendMail(mailOptions);
};

const sendOTP = async (email, otp, userType) => {
  const { user } = getMailConfig();
  await sendMailSafe({
    from: `"PropVault" <${user}>`,
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
  const { user } = getMailConfig();
  await sendMailSafe({
    from: `"PropVault" <${user}>`,
    to: email,
    subject: 'Welcome to PropVault',
    html: `<p>Hi ${name}, your ${userType} account on PropVault is ready. Start exploring premium properties today.</p>`
  });
};

const sendAgentApprovalEmail = async (email, name) => {
  const { user } = getMailConfig();
  await sendMailSafe({
    from: `"PropVault" <${user}>`,
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
  verifyEmailService,
  getMailConfig
};
