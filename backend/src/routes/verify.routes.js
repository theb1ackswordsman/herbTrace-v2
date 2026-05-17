const express = require('express');
const hashChainService = require('../services/hashChain.service');

const router = express.Router();

/**
 * GET /api/verify/:batchId
 * Public endpoint to verify the cryptographic integrity of a batch's history.
 * Used by the Consumer Timeline UI and the Regulator Dashboard.
 */
router.get('/:batchId', async (req, res) => {
  try {
    const verificationResult = await hashChainService.verifyChain(req.params.batchId);
    
    // If the chain is intact but there are no events, it might be an invalid batch ID
    if (verificationResult.totalEvents === 0) {
      return res.status(404).json({ error: 'Batch not found or no audit log events exist.' });
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Failed to verify hash chain' });
  }
});

module.exports = router;
