const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// --- Importación de Rutas ---
const merchantsRoute = require('./routes/merchants');
const salesRoute = require('./routes/sales');
const statsRoute = require('./routes/stats'); // Nueva ruta para el Scorer

// --- Configuración de Blockchain ---
const { 
  isBlockchainReady, 
  getRelayerBalance, 
  getCurrentBlock 
} = require('./config/blockchain');

// --- Inicialización ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware de Seguridad ---
app.use(helmet()); // Protege encabezados HTTP
app.use(cors());   // Habilita Cross-Origin Resource Sharing
app.use(express.json()); // Parseo de JSON en el body

// --- Rate Limiting (Protección contra abusos) ---
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Demasiadas peticiones, por favor intenta más tarde.' },
});
app.use('/api/', limiter);

// --- Endpoint de Salud (Monitoreo Crítico) ---
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
    blockchain: {
      ready: isBlockchainReady(),
      balance: null,
      blockNumber: null,
      lowFunds: false
    },
  };

  if (isBlockchainReady()) {
    try {
      const balance = await getRelayerBalance();
      health.blockchain.balance = balance;
      health.blockchain.blockNumber = await getCurrentBlock();
      
      // Alerta si el Relayer tiene menos de 0.05 MNT (no podrá pagar gas pronto)
      if (parseFloat(balance) < 0.05) {
        health.blockchain.lowFunds = true;
      }
    } catch (error) {
      health.blockchain.error = error.message;
    }
  }

  // Si no hay fondos, el status general es 'warning'
  if (health.blockchain.lowFunds) health.status = 'warning';

  res.json(health);
});

// --- Rutas de la API ---
app.use('/api/merchants', merchantsRoute);
app.use('/api/sales', salesRoute);
app.use('/api/stats', statsRoute); // Endpoint para consultar el Score

// --- Manejo de Errores y Rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error Interno:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- Inicio del Servidor ---
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    Score de Barrio Backend API - MANTLE SEPOLIA           ║
║    Version: 1.0.0                                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Servidor corriendo en el puerto: ${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
🔗 Blockchain: ${isBlockchainReady() ? '✅ Conectado' : '❌ Error de Configuración'}

📋 Endpoints Disponibles:
   GET  /health
   POST /api/merchants
   POST /api/sales
   GET  /api/stats/:merchantId  <-- ¡Nuevo!

⏰ Job de Sincronización: Activo via PM2 o 'npm run sync'
  `);
});

module.exports = app;