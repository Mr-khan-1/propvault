const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB Atlas Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('   → Check Atlas Network Access (allow your IP) and credentials in backend/.env');
    process.exit(1);
  }
};

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/user', require('./routes/user'));
app.use('/api/properties', require('./routes/property'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PropVault API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PropVault API → http://localhost:${PORT}`);
});
