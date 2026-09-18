require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`[ResumeAI Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[ResumeAI Server] Health check available at http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err, promise) => {
    console.error(`[Server Error] Unhandled rejection: ${err.message}`);
  });
}).catch(err => {
  console.error('[Server Startup Failure]:', err);
  process.exit(1);
});
