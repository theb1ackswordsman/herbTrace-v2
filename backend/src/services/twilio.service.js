const twilio = require('twilio');

/**
 * Generates a TwiML response string to send back to the user via WhatsApp.
 * @param {string} message - Text message to send
 * @param {string} [mediaUrl] - Optional URL for an image/QR code
 * @returns {string} XML TwiML string
 */
function createReply(message, mediaUrl = null) {
  const twiml = new twilio.twiml.MessagingResponse();
  const msg = twiml.message();
  msg.body(message);
  
  if (mediaUrl) {
    msg.media(mediaUrl);
  }
  
  return twiml.toString();
}

/**
 * Validates Twilio Request Signature to prevent spoofing
 */
function validateSignature(authToken, signature, url, params) {
  return twilio.validateRequest(authToken, signature, url, params);
}

module.exports = { createReply, validateSignature };
