require('dotenv').config();
const { sendOTP, verifyEmailService } = require('./utils/sendOTP');

async function test() {
  console.log("Verifying email service...");
  const isVerified = await verifyEmailService();
  console.log("Verified:", isVerified);
  
  if (isVerified) {
    try {
      console.log("Attempting to send test OTP to", process.env.EMAIL_USER);
      await sendOTP(process.env.EMAIL_USER, "123456", "user");
      console.log("SUCCESS! Email sent.");
    } catch (e) {
      console.log("FAILED to send:", e.message);
    }
  }
}
test();
