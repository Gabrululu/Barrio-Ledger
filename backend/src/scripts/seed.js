const db = require('../config/database');
const crypto = require('crypto');

async function seed() {
  console.log("🌱 Generando datos de prueba...");
  const merchantId = "0x5f449ad4cf954f2fb195441b20820ab57599a3ef73ba6c606a0062281863f384";
  
  // Generar 20 buckets de historia (aprox 5 horas de ventas continuas)
  const currentBucket = Math.floor(Date.now() / 1000 / 900);
  
  for (let i = 1; i <= 20; i++) {
    const bucket = currentBucket - i;
    const total = Math.floor(Math.random() * 5000) + 2000; // $20 - $70
    const digital = Math.floor(total * 0.6); // 60% digital
    
    db.prepare(`
      INSERT OR REPLACE INTO sync_status 
      (merchant_id, bucket, total_amount, cash_amount, digital_amount, tx_count, status, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed', strftime('%s', 'now'))
    `).run(merchantId, bucket, total, total - digital, digital, 5);
  }
  
  console.log("✅ Seeding completado. Ahora consulta /api/stats y verás un Score alto.");
}

seed();