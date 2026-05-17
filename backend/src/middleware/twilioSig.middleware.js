const { validateSignature } = require('../services/twilio.service');

/**
 * Middleware to verify that incoming requests actually originated from Twilio.
 * Prevents attackers from spoofing webhooks to create fake batches.
 */
function verifyTwilioSignature(req, res, next) {
  // If we are in local dev and without a public tunnel, skip verification to allow local testing
  if (process.env.NODE_ENV === 'development' && !process.env.WEBHOOK_BASE_URL) {
    console.warn('⚠️ Skipping Twilio Signature Verification (Local Dev Mode)');
    return next();
  }

  const signature = req.headers['x-twilio-signature'];
  const url = `${process.env.WEBHOOK_BASE_URL}/api/webhook/twilio`;
  const params = req.body;

  const isValid = validateSignature(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    params
  );

  if (!isValid) {
    console.warn('⚠️ Rejected spoofed Twilio webhook request');
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }
  
  next();
}

module.exports = { verifyTwilioSignature };
