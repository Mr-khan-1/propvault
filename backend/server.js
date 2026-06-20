const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const dns = require('dns');

// Force Google DNS to bypass Node.js querySrv ECONNREFUSED issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { initSocket } = require('./chat/socketHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true
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
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/admin', require('./api/admin'));
app.use('/api/agent', require('./api/agent'));
app.use('/api/user', require('./api/user'));
app.use('/api/properties', require('./api/property'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
