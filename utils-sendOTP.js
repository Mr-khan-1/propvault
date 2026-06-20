const nodemailer = require('nodemailer');

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email service configured successfully');
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email, otp, userType) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Real Estate Platform - Your OTP for ${userType} Registration`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 10px;">🏠 Real Estate Platform</h1>
            <p style="color: #666; text-align: center; margin-bottom: 30px; font-size: 14px;">Welcome to Pakistan's Most Trusted Property Portal</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #333; margin: 0 0 15px 0;">Hello,</p>
              <p style="color: #555; margin: 0 0 20px 0;">You're almost there! Use the OTP below to verify your ${userType} account.</p>
              
              <div style="background: #667eea; color: white; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h2 style="margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
              </div>
              
              <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">⏱️ This OTP is valid for 10 minutes only</p>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                If you didn't request this OTP, please ignore this email.<br>
                Don't share your OTP with anyone.
              </p>
            </div>

            <div style="background: #f0f4ff; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
              <p style="color: #667eea; font-size: 13px; margin: 0;">
                <strong>Need Help?</strong><br>
                Contact us at support@realestate.pk
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    throw error;
  }
};

const sendWelcomeEmail = async (email, name, userType) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Welcome to Real Estate Platform - Account Created`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Real Estate Platform! 🎉</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555;">Your ${userType} account has been successfully created! You can now access all features of our platform.</p>
            <p style="color: #555;">Start exploring thousands of properties or reach out to our agents.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  sendWelcomeEmail,
  transporter
};
