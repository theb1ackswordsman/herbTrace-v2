const crypto = require('crypto');

/**
 * Generates a SHA-256 hash for the given data string.
 */
function generateSHA256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = { generateSHA256 };
