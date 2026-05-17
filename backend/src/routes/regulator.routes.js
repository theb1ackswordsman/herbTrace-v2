const express = require('express');
const supabase = require('../config/supabase');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { parse } = require('json2csv');

const router = express.Router();

/**
 * GET /api/regulator/fraud
 * Get all fraud analysis results
 */
router.get('/fraud', verifyToken, requireRole('regulator'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fraud_flags')
      .select('*, batches(herb, quantity, users(name, phone))')
      .order('risk_score', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/regulator/farmers
 * Get all registered farmers
 */
router.get('/farmers', verifyToken, requireRole('regulator'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, phone, reputation, created_at')
      .eq('role', 'farmer')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/regulator/export
 * Export high-risk batches to CSV
 */
router.get('/export', verifyToken, requireRole('regulator'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fraud_flags')
      .select('batch_id, risk_score, risk_level, batches(herb, quantity, users(name))')
      .eq('risk_level', 'high');

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).send('No high-risk batches to export.');
    }

    // Flatten nested objects for CSV
    const csvData = data.map(row => ({
      Batch_ID: row.batch_id,
      Risk_Score: row.risk_score,
      Risk_Level: row.risk_level,
      Herb: row.batches?.herb || 'Unknown',
      Quantity_kg: row.batches?.quantity || 0,
      Farmer_Name: row.batches?.users?.name || 'Unknown'
    }));

    const csvString = parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('flagged_batches.csv');
    res.send(csvString);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
