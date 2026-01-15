require('dotenv').config();
const db = require('../config/database');
const { salesEventLog } = require('../config/contracts');
const { isBlockchainReady, waitForTransaction } = require('../config/blockchain');
const { calculateBucket } = require('../config/contracts');
// Importa Prisma
const { prisma } = require('../lib/prisma');

// Sync buckets to blockchain
async function syncBuckets() {
  console.log('\n═══════════════════════════════════════');
  console.log('Starting bucket sync job...');
  console.log('Time:', new Date().toISOString());
  console.log('═══════════════════════════════════════\n');

  if (!isBlockchainReady()) {
    console.error('✗ Blockchain not ready. Check configuration.');
    return;
  }

  try {
    // Get current bucket
    const currentBucket = calculateBucket(Math.floor(Date.now() / 1000));
    console.log(`Current bucket: ${currentBucket}`);

    // Get unsynced sales grouped by merchant and bucket
    // Only sync buckets that are complete (not current)
    const aggregated = db.prepare(`
      SELECT 
        merchant_id,
        bucket,
        SUM(amount_cents) as total_amount,
        SUM(CASE WHEN payment_method = 'cash' THEN amount_cents ELSE 0 END) as cash_amount,
        SUM(CASE WHEN payment_method = 'digital' THEN amount_cents ELSE 0 END) as digital_amount,
        COUNT(*) as tx_count
      FROM sales
      WHERE synced = 0 AND bucket < ?
      GROUP BY merchant_id, bucket
      ORDER BY bucket ASC
    `).all(currentBucket);

    if (aggregated.length === 0) {
      console.log('✓ No buckets to sync');
      return;
    }

    console.log(`Found ${aggregated.length} bucket(s) to sync\n`);

    // Acumulador de datos por merchant para scores
    let merchantData = {};

    // Process each bucket
    let successCount = 0;
    let failCount = 0;

    for (const item of aggregated) {
      try {
        console.log(`Processing: Merchant ${item.merchant_id.slice(0, 10)}... Bucket ${item.bucket}`);
        console.log(`  Amount: $${item.total_amount / 100} (${item.tx_count} txs)`);
        console.log(`  Cash: $${item.cash_amount / 100}, Digital: $${item.digital_amount / 100}`);

        // Check if already in sync_status
        const existingSync = db.prepare(`
          SELECT * FROM sync_status 
          WHERE merchant_id = ? AND bucket = ?
        `).get(item.merchant_id, item.bucket);

        if (existingSync && existingSync.status === 'confirmed') {
          console.log('  ⚠️  Already synced, marking sales...');
          markSalesAsSynced(item.merchant_id, item.bucket);
          continue;
        }

        // Calculate bucket timestamp (middle of bucket period)
        const BUCKET_DURATION = parseInt(process.env.BUCKET_DURATION) || 900;
        const bucketTimestamp = item.bucket * BUCKET_DURATION + Math.floor(BUCKET_DURATION / 2);

        // Send transaction
        console.log('  📤 Sending transaction...');
        const tx = await salesEventLog.recordSales(
          item.merchant_id,
          bucketTimestamp,
          item.total_amount,
          item.cash_amount,
          item.digital_amount,
          item.tx_count
        );

        console.log(`  ⏳ TX Hash: ${tx.hash}`);

        // Save to sync_status
        db.prepare(`
          INSERT OR REPLACE INTO sync_status 
          (merchant_id, bucket, total_amount, cash_amount, digital_amount, tx_count, tx_hash, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted')
        `).run(
          item.merchant_id,
          item.bucket,
          item.total_amount,
          item.cash_amount,
          item.digital_amount,
          item.tx_count,
          tx.hash
        );

        // Wait for confirmation
        console.log('  ⏳ Waiting for confirmation...');
        const receipt = await waitForTransaction(tx.hash, 1);

        if (receipt && receipt.status === 1) {
          console.log('  ✓ Transaction confirmed!');

          // Update sync_status
          db.prepare(`
            UPDATE sync_status 
            SET status = 'confirmed', synced_at = strftime('%s', 'now')
            WHERE merchant_id = ? AND bucket = ?
          `).run(item.merchant_id, item.bucket);

          // Mark sales as synced
          markSalesAsSynced(item.merchant_id, item.bucket);

          // Acumular datos por merchant para scores
          if (!merchantData[item.merchant_id]) {
            merchantData[item.merchant_id] = {
              totalAmount: 0,
              cashAmount: 0,
              digitalAmount: 0,
              txCount: 0,
              buckets: []
            };
          }
          merchantData[item.merchant_id].totalAmount += item.total_amount;
          merchantData[item.merchant_id].cashAmount += item.cash_amount;
          merchantData[item.merchant_id].digitalAmount += item.digital_amount;
          merchantData[item.merchant_id].txCount += item.tx_count;
          merchantData[item.merchant_id].buckets.push(item.bucket);

          successCount++;
        } else {
          console.log('  ✗ Transaction failed');
          db.prepare(`
            UPDATE sync_status 
            SET status = 'failed', error = 'Transaction reverted'
            WHERE merchant_id = ? AND bucket = ?
          `).run(item.merchant_id, item.bucket);

          failCount++;
        }

      } catch (error) {
        console.error(`  ✗ Error:`, error.message);

        // Save error to sync_status
        db.prepare(`
          INSERT OR REPLACE INTO sync_status 
          (merchant_id, bucket, total_amount, cash_amount, digital_amount, tx_count, status, error)
          VALUES (?, ?, ?, ?, ?, ?, 'failed', ?)
        `).run(
          item.merchant_id,
          item.bucket,
          item.total_amount,
          item.cash_amount,
          item.digital_amount,
          item.tx_count,
          error.message
        );

        failCount++;
      }

      console.log(''); // Empty line between buckets
    }

    console.log('═══════════════════════════════════════');
    console.log(`Sync job complete`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log('═══════════════════════════════════════\n');

    // Calcular scores y sincronizar en PostgreSQL
    console.log('Calculating scores and syncing to PostgreSQL...');
    for (const merchantId in merchantData) {
      const data = merchantData[merchantId];
      
      // Cálculos de score (placeholders - ajusta según tu lógica)
      const volume = Math.min(data.totalAmount / 10000, 100); // Normalizado a 0-100
      const diversity = (data.digitalAmount / data.totalAmount) * 100; // % digital
      const stability = 80; // Placeholder: calcula varianza de buckets
      const trend = 75; // Placeholder: calcula crecimiento
      
      const score = Math.round((volume + diversity + stability + trend) / 4);
      const scoreBreakdown = { stability, volume, trend, diversity };
      const stats = {
        salesLastMonth: data.totalAmount / 100,
        avgTicket: (data.totalAmount / data.txCount) / 100,
        transactions: data.txCount,
        cashPercentage: (data.cashAmount / data.totalAmount) * 100,
        digitalPercentage: diversity,
      };
      
      await prisma.merchant.upsert({
        where: { id: merchantId },
        update: {
          score,
          scoreBreakdown,
          stats,
        },
        create: {
          id: merchantId,
          name: `Merchant ${merchantId.slice(0, 6)}`,
          location: 'Lima, Perú',
          registeredAt: new Date().toISOString(),
          score,
          scoreBreakdown,
          stats,
        },
      });
    }
    console.log('Datos sincronizados en PostgreSQL.');

  } catch (error) {
    console.error('Fatal error in sync job:', error);
  }
}

// Helper: Mark sales as synced
function markSalesAsSynced(merchantId, bucket) {
  db.prepare(`
    UPDATE sales 
    SET synced = 1, synced_at = strftime('%s', 'now')
    WHERE merchant_id = ? AND bucket = ? AND synced = 0
  `).run(merchantId, bucket);
}

// Run if called directly
if (require.main === module) {
  syncBuckets()
    .then(() => {
      console.log('Sync job finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sync job failed:', error);
      process.exit(1);
    });
}

module.exports = syncBuckets;