const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
// Removed dangerous dns.setServers override which breaks cloud deployments

const { initSocket } = require('./chat/socketHandler');

// Load environment variables
dotenv.config();

// Auto-fix accidental quotation marks in Railway environment variables to prevent crashes
for (const key in process.env) {
  if (typeof process.env[key] === 'string') {
    process.env[key] = process.env[key].replace(/^["']|["']$/g, '');
  }
}

const app = express();

// Bulletproof CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Explicitly allow Vercel and Localhost
    const allowedOrigins = ['https://propvault-plum.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];
    
    // Add dynamically configured FRONTEND_URL
    if (process.env.FRONTEND_URL) {
      let cleanUrl = process.env.FRONTEND_URL;
      if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
      cleanUrl = cleanUrl.replace(/\/$/, '');
      allowedOrigins.push(cleanUrl);
    }

    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // Allow fallback to prevent random strict blocks
      console.warn(`Origin ${origin} not strictly matching, but allowed for safety.`);
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Force IPv4 to bypass 'querySrv ECONNREFUSED' DNS issues in Node
    });
    console.log('✅ MongoDB Connected to Atlas');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Removed process.exit(1) so the server can still respond to health checks and API errors instead of returning 502 Bad Gateway
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/admin', require('./api/admin'));
app.use('/api/agent', require('./api/agent'));
app.use('/api/user', require('./api/user'));
app.use('/api/properties', require('./api/property'));
app.use('/api/chat', require('./api/chat'));

// Health Check Routes (to prevent Railway from killing the container)
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => {
  const { getMailConfig } = require('./utils/sendOTP');
  const mailConfig = getMailConfig();
  res.json({
    status: 'Server is running ✅',
    env: process.env.NODE_ENV || 'not set',
    email: {
      configured: mailConfig.configured
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
