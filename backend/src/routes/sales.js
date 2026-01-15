const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { calculateBucket } = require('../config/contracts');

const router = express.Router();

// Middleware: Validate API key
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const merchant = db.prepare('SELECT * FROM merchants WHERE api_key = ?').get(apiKey);
  
  if (!merchant) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (!merchant.is_active) {
    return res.status(403).json({ error: 'Merchant account is inactive' });
  }

  // Attach merchant to request
  req.merchant = merchant;
  next();
}

// POST /api/sales - Record a sale
router.post('/', validateApiKey, async (req, res) => {
  try {
    const { amount, paymentMethod, timestamp } = req.body;

    // Validation
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!['cash', 'digital'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Payment method must be "cash" or "digital"' });
    }

    // Use provided timestamp or current time
    const saleTimestamp = timestamp || Math.floor(Date.now() / 1000);
    
    // Check timestamp is not in the future
    const now = Math.floor(Date.now() / 1000);
    if (saleTimestamp > now) {
      return res.status(400).json({ error: 'Timestamp cannot be in the future' });
    }

    // Calculate bucket
    const bucket = calculateBucket(saleTimestamp);

    // Convert amount to cents (assuming input is in dollars)
    const amountCents = Math.round(amount * 100);

    // Insert sale
    const saleId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO sales (id, merchant_id, amount_cents, payment_method, bucket)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(saleId, req.merchant.merchant_id, amountCents, paymentMethod, bucket);

    // Calculate next sync time (next bucket)
    const BUCKET_DURATION = parseInt(process.env.BUCKET_DURATION) || 900;
    const nextBucketTimestamp = (bucket + 1) * BUCKET_DURATION;
    const willSyncAt = new Date(nextBucketTimestamp * 1000).toISOString();

    res.status(201).json({
      success: true,
      sale: {
        id: saleId,
        merchantId: req.merchant.merchant_id,
        amount,
        amountCents,
        paymentMethod,
        bucket,
        timestamp: saleTimestamp,
      },
      sync: {
        status: 'pending',
        willSyncAt,
        message: 'Sale recorded. Will be synced to blockchain in the next bucket.',
      },
    });

  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/sales/batch - Record multiple sales at once
router.post('/batch', validateApiKey, async (req, res) => {
  try {
    const { sales } = req.body;

    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ error: 'Sales array required' });
    }

    if (sales.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 sales per batch' });
    }

    const results = [];
    const errors = [];

    // Use transaction for atomicity
    const insert = db.prepare(`
      INSERT INTO sales (id, merchant_id, amount_cents, payment_method, bucket)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((salesList) => {
      for (let i = 0; i < salesList.length; i++) {
        const sale = salesList[i];
        
        try {
          // Validation
          if (!sale.amount || sale.amount <= 0) {
            errors.push({ index: i, error: 'Invalid amount' });
            continue;
          }

          if (!['cash', 'digital'].includes(sale.paymentMethod)) {
            errors.push({ index: i, error: 'Invalid payment method' });
            continue;
          }

          const saleTimestamp = sale.timestamp || Math.floor(Date.now() / 1000);
          const bucket = calculateBucket(saleTimestamp);
          const amountCents = Math.round(sale.amount * 100);
          const saleId = uuidv4();

          insert.run(
            saleId,
            req.merchant.merchant_id,
            amountCents,
            sale.paymentMethod,
            bucket
          );

          results.push({
            id: saleId,
            amount: sale.amount,
            bucket,
          });

        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }
    });

    insertMany(sales);

    res.status(201).json({
      success: true,
      inserted: results.length,
      errors: errors.length,
      results,
      errors,
    });

  } catch (error) {
    console.error('Error recording batch sales:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/sales/merchant/:merchantId - Get sales for a merchant
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Verify merchant exists
    const merchant = db.prepare('SELECT * FROM merchants WHERE merchant_id = ?').get(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    // Get sales
    const sales = db.prepare(`
      SELECT id, amount_cents, payment_method, bucket, synced, created_at
      FROM sales
      WHERE merchant_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(merchantId, limit, offset);

    // Convert amount_cents to dollars
    const salesWithDollars = sales.map(sale => ({
      ...sale,
      amount: sale.amount_cents / 100,
    }));

    // Get total count
    const total = db.prepare('SELECT COUNT(*) as count FROM sales WHERE merchant_id = ?')
      .get(merchantId);

    res.json({
      sales: salesWithDollars,
      pagination: {
        limit,
        offset,
        total: total.count,
      },
    });

  } catch (error) {
    console.error('Error getting sales:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;