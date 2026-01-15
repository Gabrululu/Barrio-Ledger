const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../config/database');
const { merchantRegistry } = require('../config/contracts');
const { generateMerchantId } = require('../config/contracts');
const { isBlockchainReady } = require('../config/blockchain');

const router = express.Router();

// POST /api/merchants - Register new merchant
router.post('/', async (req, res) => {
  try {
    const { phone, businessName, location } = req.body;

    // Validation
    if (!phone || !businessName || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: phone, businessName, location' 
      });
    }

    // Hash phone number with salt
    const phoneHash = crypto
      .createHash('sha256')
      .update(phone + process.env.API_KEY_SALT)
      .digest('hex');

    // Generate merchant ID
    const merchantId = generateMerchantId(phoneHash);

    // Check if merchant already exists
    const existing = db.prepare('SELECT * FROM merchants WHERE merchant_id = ?').get(merchantId);
    if (existing) {
      return res.status(409).json({ 
        error: 'Merchant already registered',
        merchantId 
      });
    }

    // Generate API key
    const apiKey = 'sk_' + crypto.randomBytes(32).toString('hex');

    // Insert into local DB
    const merchantDbId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO merchants (id, merchant_id, phone_hash, business_name, location, api_key)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(merchantDbId, merchantId, phoneHash, businessName, location, apiKey);

    // Try to register on blockchain (if available)
    let txHash = null;
    let blockchainStatus = 'pending';

    if (isBlockchainReady() && merchantRegistry) {
      try {
        const tx = await merchantRegistry.register(
          merchantId,
          businessName,
          location
        );
        
        txHash = tx.hash;
        blockchainStatus = 'submitted';

        // Update DB with tx hash
        db.prepare('UPDATE merchants SET tx_hash = ? WHERE id = ?')
          .run(txHash, merchantDbId);

        console.log(`✓ Merchant registered on blockchain: ${txHash}`);
      } catch (error) {
        console.error('Failed to register on blockchain:', error.message);
        blockchainStatus = 'failed';
      }
    } else {
      blockchainStatus = 'blockchain_unavailable';
    }

    res.status(201).json({
      success: true,
      merchant: {
        id: merchantDbId,
        merchantId,
        businessName,
        location,
        apiKey, // IMPORTANT: Show only once
      },
      blockchain: {
        status: blockchainStatus,
        txHash,
      },
      message: 'Merchant registered successfully. Save your API key - it will not be shown again.',
    });

  } catch (error) {
    console.error('Error registering merchant:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/merchants/:merchantId - Get merchant info
router.get('/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;

    // Get from local DB
    const merchant = db.prepare(`
      SELECT merchant_id, business_name, location, is_active, created_at, synced_at
      FROM merchants 
      WHERE merchant_id = ?
    `).get(merchantId);

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Try to get blockchain info
    let blockchainInfo = null;
    if (isBlockchainReady() && merchantRegistry) {
      try {
        const info = await merchantRegistry.getMerchantInfo(merchantId);
        blockchainInfo = {
          isActive: info.isActive,
          registeredAt: Number(info.registeredAt),
        };
      } catch (error) {
        console.error('Failed to get blockchain info:', error.message);
      }
    }

    res.json({
      merchant,
      blockchain: blockchainInfo,
    });

  } catch (error) {
    console.error('Error getting merchant:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/merchants - List all merchants (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const merchants = db.prepare(`
      SELECT merchant_id, business_name, location, is_active, created_at
      FROM merchants 
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM merchants WHERE is_active = 1').get();

    res.json({
      merchants,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    });

  } catch (error) {
    console.error('Error listing merchants:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;