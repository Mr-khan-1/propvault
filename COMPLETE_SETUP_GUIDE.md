# Real Estate Platform - Complete Setup Guide

## 🚀 Project Overview

This is a **production-ready FYP (Final Year Project)** - a full-stack real estate buying and selling platform with:
- ✅ MongoDB Atlas (Cloud Database)
- ✅ Node.js + Express Backend
- ✅ React + Vite Frontend
- ✅ OTP-based Authentication
- ✅ Admin Dashboard
- ✅ Agent Management System
- ✅ Property Listings
- ✅ Modern UI with Tailwind CSS

---

## 📋 Prerequisites

1. **Node.js** v16+ installed
2. **npm** or **yarn** package manager
3. **MongoDB Atlas** account (Already configured)
4. **Git** (optional, for version control)
5. **Code Editor** (VS Code recommended)

---

## 🔧 Installation & Setup

### Backend Setup

#### 1. Create Backend Project Structure

```bash
mkdir real-estate-platform
cd real-estate-platform
mkdir backend frontend
cd backend
npm init -y
```

#### 2. Install Backend Dependencies

```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv nodemailer cors multer cloudinary validator
npm install --save-dev nodemon
```

#### 3. Create .env File

```bash
# Create .env file in backend directory with:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://ranahammad9795:rana786@cluster0.fqn50wf.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
GMAIL_USER=ranahammad9795@gmail.com
GMAIL_APP_PASSWORD=euzx traf cevi wuvs
FRONTEND_URL=http://localhost:5173
```

#### 4. Create Backend File Structure

```
backend/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── Admin.js
│   ├── Agent.js
│   ├── Property.js
│   ├── Inquiry.js
│   └── OTP.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── agent.js
│   ├── user.js
│   └── property.js
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── agentController.js
│   ├── userController.js
│   └── propertyController.js
├── middleware/
│   └── auth.js
├── utils/
│   └── sendOTP.js
├── .env
├── server.js
└── package.json
```

#### 5. Copy all provided backend files into their respective directories

#### 6. Start Backend Server

```bash
npm run dev
# Server should run on http://localhost:5000
```

---

### Frontend Setup

#### 1. Create React Project with Vite

```bash
cd ../frontend
npm create vite@latest . -- --template react
```

#### 2. Install Frontend Dependencies

```bash
npm install react-router-dom axios lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3. Create Frontend Directory Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PropertyCard.jsx
│   └── Loader.jsx
├── pages/
│   ├── Home.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── OTPVerification.jsx
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── AgentDashboard.jsx
│   │   └── UserDashboard.jsx
│   ├── properties/
│   │   ├── PropertyListing.jsx
│   │   └── PropertyDetail.jsx
│   └── NotFound.jsx
├── context/
│   └── AuthContext.jsx
├── utils/
│   └── api.js
├── styles/
│   └── globals.css
├── App.jsx
└── main.jsx
```

#### 4. Create .env File for Frontend

```bash
# Create .env file in frontend directory:
VITE_API_URL=http://localhost:5000/api
```

#### 5. Copy all provided frontend files into their respective directories

#### 6. Create postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 7. Start Frontend Development Server

```bash
npm run dev
# Frontend should run on http://localhost:5173
```

---

## 🔐 Database Setup (MongoDB Atlas)

### Already Configured:
- **Connection String**: mongodb+srv://ranahammad9795:rana786@cluster0.fqn50wf.mongodb.net/?appName=Cluster0
- **Collections will be created automatically** when you run the backend

### To Verify Connection:
1. Backend will log: `✅ MongoDB Connected to Atlas`
2. Check MongoDB Atlas Dashboard for collections

---

## 📧 Email Configuration (Gmail)

### Already Configured:
- **Email**: ranahammad9795@gmail.com
- **App Password**: euzx traf cevi wuvs

### How OTP Works:
1. User enters email
2. System generates 6-digit OTP
3. OTP sent to email via Gmail SMTP
4. User verifies OTP within 10 minutes
5. Account is created

---

## 🎯 Testing the Platform

### Test Accounts

#### 1. **Create a User Account**
- Go to http://localhost:5173
- Click "Register"
- Select "User / Buyer"
- Enter email, check inbox for OTP
- Complete registration

#### 2. **Create an Agent Account**
- Click "Register"
- Select "Real Estate Agent"
- Enter: Company name, License number
- Submit for admin approval

#### 3. **Admin Account** (Pre-create in MongoDB)
```javascript
// Use MongoDB Compass to insert admin:
{
  name: "Admin User",
  email: "admin@realestate.pk",
  phone: "03001234567",
  password: "admin123", // Will be hashed
  role: "super_admin",
  isActive: true
}
```

---

## 🌟 Key Features Implemented

### ✅ Authentication System
- [x] OTP-based email verification
- [x] JWT token-based authentication
- [x] Three user types: User, Agent, Admin
- [x] Password hashing with bcrypt

### ✅ Admin Dashboard
- [x] View all agents, users, properties
- [x] Approve/reject agents
- [x] Suspend accounts
- [x] View inquiries
- [x] Generate reports

### ✅ Agent Dashboard
- [x] Create/edit/delete properties
- [x] View inquiries for properties
- [x] Respond to inquiries
- [x] Manage profile
- [x] View statistics (total properties, sales, etc.)

### ✅ User Dashboard
- [x] Browse properties
- [x] Add to favorites
- [x] Send inquiries
- [x] Track inquiry status
- [x] View favorite properties
- [x] Add reviews and ratings

### ✅ Property Management
- [x] Advanced filtering (city, type, price, bedrooms)
- [x] Property details with images
- [x] View count tracking
- [x] Reviews and ratings
- [x] Favorites system

---

## 📱 API Endpoints Summary

### Authentication
```
POST /api/auth/send-otp - Send OTP
POST /api/auth/verify-otp - Verify OTP & Register
POST /api/auth/login - Login
```

### Properties
```
GET /api/properties - Get all properties
GET /api/properties/:id - Get single property
POST /api/properties/:id/reviews - Add review
POST /api/properties/:id/favorites - Add to favorites
DELETE /api/properties/:id/favorites - Remove from favorites
```

### Admin
```
GET /api/admin/dashboard - Dashboard stats
GET /api/admin/agents - All agents
PATCH /api/admin/agents/:id/approve - Approve agent
PATCH /api/admin/agents/:id/reject - Reject agent
```

### Agent
```
GET /api/agent/dashboard - Agent dashboard
GET /api/agent/properties/my-properties - My properties
POST /api/agent/properties - Create property
PATCH /api/agent/properties/:id - Update property
GET /api/agent/inquiries - My inquiries
```

### User
```
GET /api/user/dashboard - User dashboard
GET /api/user/profile - Get profile
GET /api/user/inquiries - My inquiries
GET /api/user/favorites - Favorite properties
```

---

## 🎨 Design Features

### Modern UI Components
- Gradient backgrounds
- Smooth animations (blob animation, transitions)
- Responsive design (mobile, tablet, desktop)
- Interactive cards with hover effects
- Professional color scheme (blue to indigo)

### Tailwind CSS Utilities
- Custom animations
- Gradient text
- Shadow effects
- Responsive grid layouts
- Smooth transitions

---

## 🚀 Deployment Guide

### Deploy Backend (Heroku / Railway)

```bash
# Install Heroku CLI, then:
heroku create your-app-name
heroku config:set MONGODB_URI=your-connection-string
heroku config:set JWT_SECRET=your-secret-key
git push heroku main
```

### Deploy Frontend (Vercel / Netlify)

```bash
# Vercel:
npm install -g vercel
vercel

# Netlify:
npm run build
# Upload 'dist' folder to Netlify
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify connection string in .env
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct password

### Email Not Sending
- Verify Gmail app password is correct
- Check "Less secure app access" is enabled
- Ensure 2-factor authentication is set up

### CORS Error
- Check FRONTEND_URL in backend .env
- Verify backend CORS configuration

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend .env
- Verify network connectivity

---

## 📚 Additional Resources

### MongoDB Documentation
- https://docs.mongodb.com/
- https://www.mongodb.com/docs/atlas/

### React Documentation
- https://react.dev/

### Node.js/Express
- https://expressjs.com/
- https://nodejs.org/

### Tailwind CSS
- https://tailwindcss.com/docs

---

## 📝 Important Notes

1. **Change JWT_SECRET** before production
2. **Update email configuration** if using different email service
3. **Add image upload** using Cloudinary or AWS S3
4. **Implement payment gateway** for transactions
5. **Add Google Maps** for property location
6. **Set up SSL certificates** for HTTPS
7. **Implement rate limiting** for API security
8. **Add comprehensive logging** for debugging

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs (browser & server)
3. Verify all environment variables
4. Check database connections

---

## ✅ Checklist Before Submission

- [ ] Backend running without errors
- [ ] Frontend loads successfully
- [ ] Can register user with OTP
- [ ] Can login with credentials
- [ ] Admin can approve agents
- [ ] Agent can create properties
- [ ] User can view and filter properties
- [ ] User can send inquiries
- [ ] All pages are responsive
- [ ] No console errors
- [ ] Database connections working
- [ ] Email service working (OTP sending)

---

**Good luck with your FYP! 🎉**

This is a production-ready, professional-grade project that demonstrates:
- Full-stack development
- Database design
- REST API architecture
- React component development
- Authentication & authorization
- Modern UI/UX design
- Professional development practices
