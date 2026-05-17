const supabase = require('../config/supabase');
const hashChainService = require('./hashChain.service');
const bus = require('./eventBus.service');

class FraudService {
  /**
   * Analyzes a batch using a 4-factor weighted risk model.
   * If risk score is high, it automatically flags the batch.
   */
  async analyze(batchId) {
    try {
      // Fetch batch data
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('*, users(reputation)')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) throw new Error('Batch not found for fraud analysis');

      let riskScore = 0;
      const factors = {};

      // --- Factor 1: Hash Integrity (Weight: 0.35) ---
      const verification = await hashChainService.verifyChain(batchId);
      if (!verification.chainIntact) {
        riskScore += 0.35;
        factors.hashIntegrity = { risk: 1.0, details: verification.brokenAt };
      } else {
        factors.hashIntegrity = { risk: 0.0, details: 'Chain is intact' };
      }

      // --- Factor 2: Location Anomaly (Weight: 0.25) ---
      // India's herb belt roughly between Lat 8.0 to 37.0 and Lon 68.0 to 97.0
      if (!batch.lat || !batch.lon) {
        riskScore += 0.15; // Partial penalty for missing location
        factors.location = { risk: 0.6, details: 'Missing GPS data' };
      } else if (batch.lat < 8.0 || batch.lat > 37.0 || batch.lon < 68.0 || batch.lon > 97.0) {
        riskScore += 0.25; // Full penalty for outside India
        factors.location = { risk: 1.0, details: `Suspicious coordinates: ${batch.lat}, ${batch.lon}` };
      } else {
        factors.location = { risk: 0.0, details: 'Location within expected boundaries' };
      }

      // --- Factor 3: Quantity Anomaly (Weight: 0.20) ---
      // Hardcoded threshold for simplicity (e.g., > 500kg is suspicious for a single small farmer)
      if (batch.quantity > 500) {
        riskScore += 0.20;
        factors.quantity = { risk: 1.0, details: `Unusually large quantity: ${batch.quantity}kg` };
      } else {
        factors.quantity = { risk: 0.0, details: 'Normal quantity' };
      }

      // --- Factor 4: Farmer Reputation (Weight: 0.20) ---
      const rep = batch.users ? parseFloat(batch.users.reputation) : 5.0;
      if (rep < 2.5) {
        riskScore += 0.20;
        factors.reputation = { risk: 1.0, details: `Very low reputation: ${rep}` };
      } else if (rep < 3.5) {
        riskScore += 0.10;
        factors.reputation = { risk: 0.5, details: `Moderate reputation: ${rep}` };
      } else {
        factors.reputation = { risk: 0.0, details: `Good reputation: ${rep}` };
      }

      // --- Determine Risk Level ---
      let riskLevel = 'low';
      if (riskScore >= 0.70) riskLevel = 'high';
      else if (riskScore >= 0.30) riskLevel = 'medium';

      // --- Save Result ---
      const { data: fraudRecord, error: fraudError } = await supabase
        .from('fraud_flags')
        .insert([{
          batch_id: batchId,
          risk_score: riskScore,
          risk_level: riskLevel,
          factors
        }]);

      if (fraudError) throw fraudError;

      // If high risk, update batch status and emit event
      if (riskLevel === 'high') {
        await supabase.from('batches').update({ status: 'flagged' }).eq('id', batchId);
        
        // Use a slight delay to ensure eventBus is fully resolved since there's a circular dep
        setTimeout(() => {
          bus.emit('FRAUD_FLAGGED', {
            batchId,
            actorId: null, // System event
            payload: { riskScore, factors, action: 'Auto-flagged by Fraud Engine' }
          });
        }, 100);
        console.warn(`[FraudEngine] 🚨 Batch ${batchId} FLAGGED. Score: ${riskScore}`);
      } else {
        console.log(`[FraudEngine] ✅ Batch ${batchId} passed analysis. Score: ${riskScore}`);
      }

    } catch (error) {
      console.error('[FraudEngine] Error analyzing batch:', error);
    }
  }
}

module.exports = new FraudService();
