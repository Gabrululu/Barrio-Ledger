const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { calculateMerchantScore } = require('../services/scorer');

router.get('/:merchantId', async (req, res) => {
  const { merchantId } = req.params;

  try {
    // 1. Obtener datos de buckets confirmados
    const stats = db.prepare(`
      SELECT * FROM sync_status 
      WHERE merchant_id = ? AND status = 'confirmed'
      ORDER BY bucket DESC LIMIT 100
    `).all(merchantId);

    // Si no hay datos, devolvemos un estado inicial en lugar de error
    if (!stats || stats.length === 0) {
      return res.json({
        merchantId,
        score: 0,
        rating: 'Sin historial',
        totalBucketsSynced: 0,
        message: 'El comercio no tiene datos sincronizados en blockchain aún.'
      });
    }

    // 2. Calcular el score usando el servicio
    // IMPORTANTE: result es un objeto { score, breakdown }
    const result = calculateMerchantScore(stats);
    const finalScore = result.score;

    // 3. Responder con el desglose completo
    res.json({
      merchantId,
      score: finalScore,
      rating: finalScore >= 70 ? 'Excelente' : finalScore >= 40 ? 'Bueno' : 'Riesgoso',
      breakdown: result.breakdown, // Para que el frontend muestre las barritas de progreso
      totalBucketsSynced: stats.length,
      lastUpdate: stats[0]?.synced_at
    });

  } catch (error) {
    console.error('Error en Stats Route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;