require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const batchRoutes = require('./routes/batch.routes');
const webhookRoutes = require('./routes/webhook.routes');
const verifyRoutes = require('./routes/verify.routes');
const regulatorRoutes = require('./routes/regulator.routes');

const { verifyTwilioSignature } = require('./middleware/twilioSig.middleware');
const { webhookLimiter, authLimiter, globalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// ── Security Middleware ──────────────────────────────────────────────
// Helmet sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

// CORS: Only allow the frontend origin, not wildcard *
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Global rate limit: 100 requests per 15 minutes per IP
app.use(globalLimiter);

// Body parsers
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true })); // Parse form-encoded bodies (Twilio webhooks)

// ── Routes ───────────────────────────────────────────────────────────
// Auth routes get a strict brute-force limiter on login
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/regulator', regulatorRoutes);

// Webhook: rate limit + Twilio signature verification
app.use('/api/webhook/twilio', webhookLimiter, verifyTwilioSignature, webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────────────────────
// Catches unhandled errors and prevents stack traces from leaking to clients
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err);
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
