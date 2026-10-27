const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { connectDB, getDbStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security & Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Database Status Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'ok',
    service: 'KeepLoop API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: {
      type: dbStatus.type || 'MongoDB',
      ...dbStatus,
      connectionGuide: !dbStatus.connected
        ? 'Update MONGODB_URI in server/.env with your MongoDB connection string.'
        : 'Connected and operational.',
    },
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/lifecycle', require('./routes/lifecycle'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Atlas (Cloud)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 KeepLoop Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
  });
};

startServer();

