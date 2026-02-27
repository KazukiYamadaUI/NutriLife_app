import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimit';
import apiRoutes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(generalLimiter);

// Health check
app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', apiRoutes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);

async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`\n🚀 NutriLife Backend Server`);
      console.log(`   Running on http://localhost:${PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Gemini: ${env.GEMINI_API_KEY ? '✓ configured' : '✗ mock mode'}`);
      console.log(`   Twilio: ${env.TWILIO_ACCOUNT_SID ? '✓ configured' : '✗ dev mode (codes logged to console)'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

start();
