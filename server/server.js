require('dotenv').config();
const validateEnv = require('./config/validateEnv');
const app = require('./app');
const { connectDB } = require('./config/db');

// Run environment configuration validation
validateEnv();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`[AI ATS Optimizer Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[AI ATS Optimizer Server] Health check available at http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[Server Error] Unhandled rejection: ${err.message}`);
  });
}).catch(err => {
  console.error('[Server Startup Failure]:', err);
  process.exit(1);
});
