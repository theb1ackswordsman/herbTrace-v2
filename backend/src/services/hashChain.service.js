const supabase = require('../config/supabase');
const { generateSHA256 } = require('../utils/hash.util');

class HashChainService {
  /**
   * Appends a new event to the tamper-proof audit log.
   */
  async append(batchId, eventType, eventData, actorId = null) {
    // 1. Get the latest hash for this batch
    const { data: lastRecord, error: fetchError } = await supabase
      .from('audit_log')
      .select('current_hash')
      .eq('batch_id', batchId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    // If no previous record, it's the GENESIS block for this batch
    const prevHash = lastRecord ? lastRecord.current_hash : 'GENESIS';

    // 2. Prepare the payload to hash
    const payload = JSON.stringify({
      ...eventData,
      timestamp: Date.now() // Adds uniqueness to exact same events
    });

    // 3. Generate the new hash
    const currentHash = generateSHA256(prevHash + payload);

    // 4. Insert into the audit log
    const { data, error } = await supabase
      .from('audit_log')
      .insert([{
        batch_id: batchId,
        event_type: eventType,
        actor_id: actorId,
        event_data: JSON.parse(payload),
        prev_hash: prevHash,
        current_hash: currentHash
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to append to hash chain:', error);
      throw error;
    }

    return data;
  }

  /**
   * Verifies the entire hash chain for a specific batch.
   * Walks from the first record to the last, verifying every hash.
   */
  async verifyChain(batchId) {
    const { data: records, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('batch_id', batchId)
      .order('id', { ascending: true });

    if (error) throw error;
    if (!records || records.length === 0) {
      return { chainIntact: false, totalEvents: 0, error: 'No records found' };
    }

    let previousHash = 'GENESIS';
    const verifiedEvents = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 1. Check link to previous record
      if (record.prev_hash !== previousHash) {
        return {
          chainIntact: false,
          totalEvents: records.length,
          brokenAt: {
            recordId: record.id,
            issue: 'Broken Link',
            expectedPrevHash: previousHash,
            actualPrevHash: record.prev_hash
          }
        };
      }

      // 2. Recompute and check current hash (Tamper check)
      const expectedCurrentHash = generateSHA256(record.prev_hash + JSON.stringify(record.event_data));
      if (record.current_hash !== expectedCurrentHash) {
        return {
          chainIntact: false,
          totalEvents: records.length,
          brokenAt: {
            recordId: record.id,
            issue: 'Data Tampered',
            expectedHash: expectedCurrentHash,
            actualHash: record.current_hash
          }
        };
      }

      // Chain is intact up to this point
      previousHash = record.current_hash;
      verifiedEvents.push({
        type: record.event_type,
        timestamp: record.created_at,
        verified: true
      });
    }

    return {
      batchId,
      totalEvents: records.length,
      chainIntact: true,
      brokenAt: null,
      events: verifiedEvents
    };
  }
}

module.exports = new HashChainService();
