const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // ADDED: jwt import
require('dotenv').config();

const app = express();

// Middleware
// In server.js - replace the current CORS line
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true
}));
app.use(express.json());

console.log('✅ Backend Server Starting...');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
})
.catch((error) => {
  console.log('❌ MongoDB Connection Error:', error.message);
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected to:', MONGODB_URI);
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/User');
const bookingsRoutes = require('./routes/Bookings'); // ADDED: bookings routes import

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);

// Admin login (single route - fixed)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' }); // FIXED: use jwt instead of require
    return res.json({ 
      message: 'Admin login successful', 
      token,
      user: { email: email, role: 'admin' }
    });
  }
  res.status(401).json({ error: 'Invalid admin credentials' });
});

// Test routes (keep existing)
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected';
  
  res.json({ 
    message: 'DreamTrips BACKEND Server is running!',
    status: 'OK',
    database: dbStatus,
    databaseState: mongoose.connection.readyState // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.get('/api', (req, res) => {
  res.json({ 
    message: 'DreamTrips API is running!',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      bookings: '/api/bookings',
      admin: '/api/admin'
    },
    status: 'OK'
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ BACKEND Server running on port ${PORT}`);
  console.log(`🌐 Test: http://localhost:${PORT}`);
  console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
  console.log(`🔐 Auth: POST /api/auth/login or /api/auth/register`);
  console.log(`👥 Users: GET /api/users (with token)`);
  console.log(`📝 Bookings: POST/GET /api/bookings (with token)`);
  console.log(`🛡️ Admin: POST /api/admin/login`);
});