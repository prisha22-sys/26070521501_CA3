const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;
let activeDbType = 'MongoDB';

const normalizeMongoUri = (rawUri) => {
  if (!rawUri) return '';
  let uri = rawUri.trim();

  // If local URI without db name, e.g. "mongodb://localhost:27017/" or "mongodb://localhost:27017"
  if (uri.startsWith('mongodb://') && !uri.includes('mongodb+srv://')) {
    const afterProtocol = uri.substring('mongodb://'.length);
    if (!afterProtocol.includes('/')) {
      uri = `${uri}/keeploop`;
    } else if (uri.endsWith('/')) {
      uri = `${uri}keeploop`;
    }
  }
  return uri;
};

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;

  // Check if URI is missing or still using placeholder values
  const hasPlaceholders = !rawUri || 
    rawUri.includes('<username>') || 
    rawUri.includes('<password>') || 
    rawUri.includes('<cluster-name>') ||
    rawUri.trim() === '';

  if (hasPlaceholders) {
    isConnected = false;
    connectionError = 'MongoDB connection string is not configured yet in server/.env';
    console.warn('\n' + '='.repeat(70));
    console.warn('⚠️  MONGODB NOT CONFIGURED');
    console.warn('='.repeat(70));
    console.warn('Your server/.env file currently contains placeholder credentials.');
    console.warn('Please update MONGODB_URI in server/.env with your local or Atlas connection string.');
    console.warn('Example: mongodb://localhost:27017/keeploop');
    console.warn('='.repeat(70) + '\n');
    return false;
  }

  const uri = normalizeMongoUri(rawUri);
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
  activeDbType = isLocal ? 'Local MongoDB Server' : 'MongoDB Atlas (Cloud)';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    connectionError = null;
    console.log(`\n✅ ${activeDbType} Connected Successfully!`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port || '27017'}`);
    console.log(`📦 Database: ${conn.connection.name}\n`);
    return true;
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    console.error('\n' + '='.repeat(70));
    console.error(`❌ ${activeDbType} CONNECTION FAILED`);
    console.error('='.repeat(70));
    console.error(`Error: ${error.message}`);
    if (isLocal) {
      console.error('\nLocal Troubleshooting Checklist:');
      console.error('1. Verify your local MongoDB service is running (Port 27017).');
      console.error('2. Ensure no firewall is blocking localhost / 127.0.0.1.');
    } else {
      console.error('\nAtlas Troubleshooting Checklist:');
      console.error('1. Ensure 0.0.0.0/0 is whitelisted in Network Access.');
      console.error('2. Check username/password URL encoding.');
    }
    console.error('='.repeat(70) + '\n');
    return false;
  }
};

const getDbStatus = () => ({
  connected: isConnected,
  type: activeDbType,
  error: connectionError,
  configured: !process.env.MONGODB_URI?.includes('<username>') && !!process.env.MONGODB_URI,
});

// Middleware to guard database operations when not connected
const requireDb = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({
      success: false,
      error: `Database not connected. Please verify your connection string in server/.env (${activeDbType}).`,
      dbStatus: getDbStatus(),
    });
  }
  next();
};

module.exports = { connectDB, getDbStatus, requireDb };
