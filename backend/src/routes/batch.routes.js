const express = require('express');
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validate, rateSchema } = require('../middleware/validate.middleware');
const bus = require('../services/eventBus.service');

const router = express.Router();

// Get all batches (For Factory/Regulator dashboards)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*, users(name, phone)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single batch by ID (Public, for consumer view)
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('batches')
      .select('*, users(name, phone, reputation)')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Factory receives a batch (Scanning the QR code)
router.post('/:id/receive', verifyToken, requireRole('factory'), async (req, res) => {
  const batchId = req.params.id;
  try {
    const { data: batch, error } = await supabase
      .from('batches')
      .update({ status: 'received', updated_at: new Date().toISOString() })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;

    bus.emit('BATCH_RECEIVED', {
      batchId,
      actorId: req.user.id,
      payload: { action: 'Batch Received at Factory', factoryId: req.user.id }
    });

    res.json({ message: 'Batch marked as received', batch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Factory rates quality
router.post('/:id/rate', verifyToken, requireRole('factory'), validate(rateSchema), async (req, res) => {
  const batchId = req.params.id;
  const { quality, factory_rating } = req.body; // e.g., quality: 'A', factory_rating: 4

  try {
    const { data: batch, error } = await supabase
      .from('batches')
      .update({ status: 'rated', quality, factory_rating, updated_at: new Date().toISOString() })
      .eq('id', batchId)
      .select()
      .single();

    if (error) throw error;

    // We emit QUALITY_RATED. The event bus will append to the hash chain
    // AND trigger the fraud.service.js risk analysis!
    bus.emit('QUALITY_RATED', {
      batchId,
      actorId: req.user.id,
      payload: { quality, factory_rating, action: 'Quality Rated by Factory' }
    });

    res.json({ message: 'Batch rated successfully', batch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
