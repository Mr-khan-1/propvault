# Real Estate Platform - FYP Project
## Complete Architecture

```
real-estate-platform/
├── backend/
│   ├── config/
│   │   └── db.js (MongoDB Atlas Connection)
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── Agent.js
│   │   ├── Property.js
│   │   ├── Inquiry.js
│   │   └── OTP.js
│   ├── routes/
│   │   ├── auth.js (Login, Registration, OTP)
│   │   ├── admin.js (Admin Dashboard APIs)
│   │   ├── agent.js (Agent APIs)
│   │   ├── user.js (User APIs)
│   │   └── property.js (Property Management)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── agentController.js
│   │   ├── userController.js
│   │   └── propertyController.js
│   ├── middleware/
│   │   ├── auth.js (JWT Verification)
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── sendOTP.js (Nodemailer)
│   ├── .env (MongoDB & Gmail Config)
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   └── Loader.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── OTPVerification.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AgentDashboard.jsx
│   │   │   │   └── UserDashboard.jsx
│   │   │   ├── properties/
│   │   │   │   ├── PropertyListing.jsx
│   │   │   │   ├── PropertyDetail.jsx
│   │   │   │   └── PropertyForm.jsx
│   │   │   └── NotFound.jsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── utils/
│   │   │   └── api.js (Axios Instance)
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
```

## Database Design (MongoDB)

### Collections:
1. **Users** - Regular users/buyers
2. **Admins** - Platform administrators
3. **Agents** - Real estate agents
4. **Properties** - Property listings
5. **Inquiries** - User inquiries
6. **OTPs** - OTP verification

## API Endpoints Summary

### Auth
- POST `/api/auth/send-otp` - Send OTP
- POST `/api/auth/verify-otp` - Verify OTP & Create Account
- POST `/api/auth/login` - Login

### Admin
- GET `/api/admin/dashboard` - Dashboard stats
- GET `/api/admin/agents` - All agents
- PATCH `/api/admin/agents/:id/approve` - Approve agent
- GET `/api/admin/properties` - All properties

### Agent
- GET `/api/agent/properties` - Agent's properties
- POST `/api/agent/properties` - Create property
- PATCH `/api/agent/properties/:id` - Update property
- GET `/api/agent/inquiries` - Agent's inquiries

### Properties
- GET `/api/properties` - All properties (with filters)
- GET `/api/properties/:id` - Single property

### User
- POST `/api/user/inquiry` - Send inquiry
- GET `/api/user/inquiries` - My inquiries

## Connection Details
- MongoDB: mongodb+srv://ranahammad9795:rana786@cluster0.fqn50wf.mongodb.net/?appName=Cluster0
- Email: ranahammad9795@gmail.com
- Gmail App Password: euzx traf cevi wuvs
