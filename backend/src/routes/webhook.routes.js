const express = require('express');
const { createReply } = require('../services/twilio.service');
const supabase = require('../config/supabase');
const { uploadImageBuffer } = require('../services/upload.service');
const { generateQRBuffer } = require('../services/qr.service');
const bus = require('../services/eventBus.service');

const router = express.Router();

router.post('/', async (req, res) => {
  const { Body, From, NumMedia, MediaUrl0, MediaContentType0 } = req.body;
  const phone = From; // format: 'whatsapp:+14155238886'
  const text = Body ? Body.trim() : '';

  try {
    // 1. Find or create conversation state
    let { data: stateData, error } = await supabase
      .from('conversation_state')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code === 'PGRST116') { // Not found
      const { data: newRow } = await supabase
        .from('conversation_state')
        .insert([{ phone, state: 'IDLE', draft_data: {} }])
        .select()
        .single();
      stateData = newRow;
    } else if (error) {
      throw error;
    }

    // Look up farmer in users table
    const { data: user } = await supabase
      .from('users')
      .select('id, name')
      .eq('phone', phone)
      .single();

    if (!user) {
      const reply = createReply("Welcome to HerbTrace! Please ask your administrator to register your phone number first.");
      return res.type('text/xml').send(reply);
    }

    let nextState = stateData.state;
    let draftData = stateData.draft_data;
    let replyText = "";
    let mediaReplyUrl = null;

    // 2. State Machine Logic
    if (text.toLowerCase() === 'new' || text.toLowerCase() === 'reset') {
      nextState = 'HERB_NAME';
      draftData = {};
      replyText = "🌿 What herb are you submitting? (e.g. Ashwagandha, Tulsi)";
    } else {
      switch (stateData.state) {
        case 'IDLE':
          replyText = `Namaste ${user.name}! Type "new" to register a new herb batch.`;
          break;

        case 'HERB_NAME':
          draftData.herb = text;
          nextState = 'QUANTITY';
          replyText = `Great. How many kg of ${text} are in this batch? (e.g. 50)`;
          break;

        case 'QUANTITY':
          const qty = parseFloat(text);
          if (isNaN(qty)) {
            replyText = "Please enter a valid number for the quantity in kg.";
            break;
          }
          draftData.quantity = qty;
          nextState = 'PHOTO';
          replyText = `Got it, ${qty}kg. Please send a photo of the harvest to complete registration.`;
          break;

        case 'PHOTO':
          if (NumMedia !== '0' && MediaUrl0) {
            // Fetch image from Twilio using native fetch API
            const response = await fetch(MediaUrl0);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Upload harvest photo to Cloudinary
            const imageUrl = await uploadImageBuffer(buffer, MediaContentType0);
            
            const batchId = `BT-${Date.now()}`;
            
            // Generate QR Code and Upload to Cloudinary so Twilio can send it back
            // (We assume the frontend URL will be at a given domain, e.g., localhost or Vercel)
            const qrUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${batchId}`;
            const qrBuffer = await generateQRBuffer(qrUrl);
            const qrImageUrl = await uploadImageBuffer(qrBuffer, 'image/png');
            
            // Insert into batches table
            const { error: batchError } = await supabase
              .from('batches')
              .insert([{
                id: batchId,
                farmer_id: user.id,
                herb: draftData.herb,
                quantity: draftData.quantity,
                image_url: imageUrl,
                status: 'created'
              }]);
              
            if (batchError) throw batchError;

            // Emit Event to Hash Chain
            bus.emit('BATCH_CREATED', {
              batchId,
              actorId: user.id,
              payload: {
                herb: draftData.herb,
                quantity: draftData.quantity,
                image_url: imageUrl,
                action: 'Batch Registered by Farmer via WhatsApp'
              }
            });

            replyText = `✅ Batch Registered Successfully!\n\nID: ${batchId}\nHerb: ${draftData.herb}\nQty: ${draftData.quantity}kg\n\nShow this QR code to the factory upon delivery.`;
            mediaReplyUrl = qrImageUrl; // Twilio will send the QR code image back!
            
            nextState = 'IDLE';
            draftData = {};
          } else {
            replyText = "Please send an image attachment to proceed. Type 'reset' to cancel.";
          }
          break;

        default:
          nextState = 'IDLE';
          draftData = {};
          replyText = "State reset. Type 'new' to start.";
      }
    }

    // 3. Save new state
    await supabase
      .from('conversation_state')
      .update({ state: nextState, draft_data: draftData, updated_at: new Date().toISOString() })
      .eq('phone', phone);

    // 4. Send Twilio Reply
    const twimlReply = createReply(replyText, mediaReplyUrl);
    res.type('text/xml').send(twimlReply);

  } catch (error) {
    console.error('Webhook error:', error);
    const errorReply = createReply("An internal error occurred. Please type 'reset' and try again.");
    res.type('text/xml').send(errorReply);
  }
});

module.exports = router;
