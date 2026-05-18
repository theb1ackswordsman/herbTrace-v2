const QRCode = require('qrcode');

/**
 * Generates a Data URI containing a base64 encoded PNG of the QR code
 * @param {string} text - The text/URL to encode
 * @returns {Promise<string>} Base64 Data URI
 */
async function generateQRDataURI(text) {
  try {
    const url = await QRCode.toDataURL(text);
    return url;
  } catch (err) {
    console.error('QR Generation failed:', err);
    throw err;
  }
}

/**
 * Generates a QR Code as a Buffer (useful for uploading to Cloudinary/sending via WhatsApp directly)
 */
async function generateQRBuffer(text) {
  try {
    const buffer = await QRCode.toBuffer(text);
    return buffer;
  } catch (err) {
    console.error('QR Buffer Generation failed:', err);
    throw err;
  }
}

module.exports = { generateQRDataURI, generateQRBuffer };
