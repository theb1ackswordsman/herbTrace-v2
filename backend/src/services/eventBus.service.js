const EventEmitter = require('events');
const hashChainService = require('./hashChain.service');

const bus = new EventEmitter();

// --- Register Listeners ---

bus.on('BATCH_CREATED', async (data) => {
  try {
    await hashChainService.append(data.batchId, 'BATCH_CREATED', data.payload, data.actorId);
    console.log(`[EventBus] BATCH_CREATED appended for ${data.batchId}`);
  } catch (err) {
    console.error(`[EventBus] Failed to process BATCH_CREATED:`, err);
  }
});

bus.on('BATCH_RECEIVED', async (data) => {
  try {
    await hashChainService.append(data.batchId, 'BATCH_RECEIVED', data.payload, data.actorId);
    console.log(`[EventBus] BATCH_RECEIVED appended for ${data.batchId}`);
  } catch (err) {
    console.error(`[EventBus] Failed to process BATCH_RECEIVED:`, err);
  }
});

bus.on('QUALITY_RATED', async (data) => {
  try {
    await hashChainService.append(data.batchId, 'QUALITY_RATED', data.payload, data.actorId);
    console.log(`[EventBus] QUALITY_RATED appended for ${data.batchId}`);
    
    // Trigger fraud analysis
    const fraudService = require('./fraud.service');
    fraudService.analyze(data.batchId);
  } catch (err) {
    console.error(`[EventBus] Failed to process QUALITY_RATED:`, err);
  }
});

bus.on('FRAUD_FLAGGED', async (data) => {
  try {
    await hashChainService.append(data.batchId, 'FRAUD_FLAGGED', data.payload, data.actorId);
    console.log(`[EventBus] FRAUD_FLAGGED appended for ${data.batchId}`);
  } catch (err) {
    console.error(`[EventBus] Failed to process FRAUD_FLAGGED:`, err);
  }
});

bus.on('BATCH_VERIFIED', async (data) => {
  try {
    await hashChainService.append(data.batchId, 'BATCH_VERIFIED', data.payload, data.actorId);
    console.log(`[EventBus] BATCH_VERIFIED appended for ${data.batchId}`);
  } catch (err) {
    console.error(`[EventBus] Failed to process BATCH_VERIFIED:`, err);
  }
});

module.exports = bus;
