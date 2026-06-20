# 🏰 PropVault - Premium Real Estate Platform

PropVault is a state-of-the-art, modern real estate platform that seamlessly connects buyers, sellers, and professional agents. Featuring a stunning glassmorphism UI, real-time agent communication, and secure multi-role authentication.

![PropVault Banner](https://via.placeholder.com/1200x400/0f172a/f59e0b?text=PropVault+Premium+Real+Estate)

## ✨ Key Features

- **Multi-Role Dashboards**: Dedicated UI and functionalities for Users (Buyers/Sellers), Agents, and System Admins.
- **Real-Time Communication**: Integrated WebSocket (Socket.io) system allowing live chat between users and agents directly from property inquiries.
- **WebRTC Video/Audio Calling**: Built-in peer-to-peer calling for virtual property tours and secure agent communications.
- **Advanced Authentication**: 
  - Dynamic Password Strength indicator
  - 60-second Cooldown Email OTP Verification
  - Google reCAPTCHA Integration
  - JWT Cookie-based Sessions
- **Premium Glassmorphism UI**: Beautiful, fully responsive dark-mode interface built with Tailwind CSS, featuring subtle animations and micro-interactions via Framer Motion.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Dark Mode Glass UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-Time**: Socket.io-client, PeerJS

### Backend (Server)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Communication**: Socket.io, PeerJS Signaling
- **Utilities**: Nodemailer (OTP Service)

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mr-khan-1/propvault.git
   cd propvault
   ```

2. **Install all dependencies:**
   *(The root package.json handles installing both frontend and backend dependencies)*
   ```bash
   npm run install-all
   ```

3. **Environment Configuration:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_16_char_gmail_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Development Servers:**
   This command starts both the Vite frontend and Express backend concurrently!
   ```bash
   npm run dev
   ```

## 🔒 Security Implementations

- **Password Hashing**: Passwords are never stored in plain text.
- **XSS Protection**: React strictly escapes all user input.
- **Input Sanitization**: Password complexity enforced at both frontend and backend.
- **Rate Limiting**: Integrated into Express to prevent brute force OTP attacks.
- **Hidden Credentials**: Environment variables strictly managed via `.env` (ignored in Git).

## 📄 License
This project is proprietary and confidential.

---
*Built with passion for modern web experiences.*
