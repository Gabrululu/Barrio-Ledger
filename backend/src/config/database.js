const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database path from env or default
const dbPath = process.env.DATABASE_PATH || './data/scoredebarrio.db';
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath, { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : null 
});

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
function initSchema() {
  // Merchants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      merchant_id TEXT UNIQUE NOT NULL,
      phone_hash TEXT NOT NULL,
      business_name TEXT,
      location TEXT,
      api_key TEXT UNIQUE,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER,
      tx_hash TEXT
    );
  `);

  // Sales table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'digital')),
      bucket INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      synced_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id)
    );
  `);

  // Sync status table (tracking blockchain sync)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      merchant_id TEXT NOT NULL,
      bucket INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      cash_amount INTEGER NOT NULL,
      digital_amount INTEGER NOT NULL,
      tx_count INTEGER NOT NULL,
      tx_hash TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'confirmed', 'failed')),
      error TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER,
      UNIQUE(merchant_id, bucket)
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sales_bucket ON sales(bucket, synced);
    CREATE INDEX IF NOT EXISTS idx_sales_merchant ON sales(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_status(status, bucket);
  `);

  console.log('✓ Database schema initialized');
}

// Initialize on import
initSchema();

module.exports = db;