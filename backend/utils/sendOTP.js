const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')
  }
});

transporter.verify((error) => {
  if (error) {
    console.log('❌ Email config error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('   → OTP will still work in dev mode (shown in console / on screen).');
      console.log('   → Fix Gmail: enable 2FA → App Passwords → update GMAIL_APP_PASSWORD in backend/.env');
    }
  } else {
    console.log('✅ Email service ready');
  }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp, userType) => {
  await transporter.sendMail({
    from: `"PropVault" <${process.env.GMAIL_USER}>`,
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
  await transporter.sendMail({
    from: `"PropVault" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to PropVault',
    html: `<p>Hi ${name}, your ${userType} account on PropVault is ready. Start exploring premium properties today.</p>`
  });
};

const sendAgentApprovalEmail = async (email, name) => {
  await transporter.sendMail({
    from: `"PropVault" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Agent Account Approved — PropVault',
    html: `<p>Hi ${name}, your agent account has been approved. You can now login and list properties.</p>`
  });
};

module.exports = { generateOTP, sendOTP, sendWelcomeEmail, sendAgentApprovalEmail, transporter };
