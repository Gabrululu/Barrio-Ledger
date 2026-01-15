# 🏗️ Score de Barrio - Backend API

Backend/Relayer para Score de Barrio. Agrega ventas de comercios y las sincroniza con smart contracts en Mantle Sepolia.

---

## 🚀 Quick Start

### 1. Instalación

```bash
# Clonar el proyecto
git clone <repo-url>
cd score-de-barrio-backend

# Instalar dependencias
npm install

# Configurar environment
cp .env.example .env
nano .env  # Editar con tus valores
```

### 2. Configuración

Edita `.env` con:
- `RELAYER_PRIVATE_KEY`: Tu private key (necesita fondos en Mantle Sepolia)
- `MERCHANT_REGISTRY`: Address del contrato MerchantRegistry
- `SALES_EVENT_LOG`: Address del contrato SalesEventLog

### 3. Iniciar Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará en `http://localhost:3000`

---

## 📋 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "blockchain": {
    "ready": true,
    "balance": "0.5",
    "blockNumber": 33367800
  }
}
```

### Registrar Comercio
```bash
POST /api/merchants
Content-Type: application/json

{
  "phone": "+51987654321",
  "businessName": "Bodega Don Pepe",
  "location": "Miraflores, Lima"
}

Response:
{
  "success": true,
  "merchant": {
    "id": "uuid-...",
    "merchantId": "0x265...",
    "apiKey": "sk_abc123..."  # ⚠️ Guardar, no se muestra de nuevo
  },
  "blockchain": {
    "status": "submitted",
    "txHash": "0x467..."
  }
}
```

### Registrar Venta
```bash
POST /api/sales
Content-Type: application/json
X-API-Key: sk_abc123...

{
  "amount": 25.50,
  "paymentMethod": "cash",  # o "digital"
  "timestamp": 1768279853   # opcional
}

Response:
{
  "success": true,
  "sale": {
    "id": "uuid-...",
    "amount": 25.50,
    "bucket": 1964755
  },
  "sync": {
    "status": "pending",
    "willSyncAt": "2024-01-13T15:15:00Z"
  }
}
```

### Registrar Ventas en Lote
```bash
POST /api/sales/batch
Content-Type: application/json
X-API-Key: sk_abc123...

{
  "sales": [
    { "amount": 10.00, "paymentMethod": "cash" },
    { "amount": 15.50, "paymentMethod": "digital" },
    { "amount": 8.75, "paymentMethod": "cash" }
  ]
}

Response:
{
  "success": true,
  "inserted": 3,
  "errors": 0
}
```

### Ver Ventas de un Comercio
```bash
GET /api/sales/merchant/0x265...?limit=50&offset=0

Response:
{
  "sales": [
    {
      "id": "uuid-...",
      "amount": 25.50,
      "payment_method": "cash",
      "bucket": 1964755,
      "synced": true,
      "created_at": 1768279853
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 127
  }
}
```

---

## 🔄 Sincronización con Blockchain

### Manual (para testing)
```bash
npm run sync
```

### Automática (producción)

Opción 1: Cron del sistema
```bash
# Editar crontab
crontab -e

# Agregar línea (cada 15 minutos)
*/15 * * * * cd /path/to/backend && npm run sync >> /var/log/sync.log 2>&1
```

Opción 2: PM2 con cron
```bash
npm install -g pm2

# Start server
pm2 start src/server.js --name "score-api"

# Start sync job (cada 15 min)
pm2 start src/jobs/syncBuckets.js --name "score-sync" --cron "*/15 * * * *" --no-autorestart
```

---

## 🗄️ Base de Datos

El backend usa **SQLite** por simplicidad. Los datos se guardan en `./data/scoredebarrio.db`

### Tablas:

**merchants**: Comercios registrados
- `merchant_id`: ID on-chain (bytes32)
- `api_key`: Para autenticación
- `business_name`, `location`: Info del negocio

**sales**: Ventas registradas
- `merchant_id`: Comercio que hizo la venta
- `amount_cents`: Monto en centavos
- `payment_method`: "cash" o "digital"
- `bucket`: Bucket de tiempo (para agregar)
- `synced`: Si ya se envió al blockchain

**sync_status**: Estado de sincronización
- `merchant_id`, `bucket`: Identificador único
- `tx_hash`: Hash de la transacción
- `status`: pending/submitted/confirmed/failed

### Backup
```bash
# Backup manual
cp ./data/scoredebarrio.db ./backups/backup-$(date +%Y%m%d).db

# Backup automático (cron diario)
0 2 * * * cp /path/to/data/scoredebarrio.db /path/to/backups/backup-$(date +\%Y\%m\%d).db
```

---

## 🧪 Testing

### Registrar comercio de prueba
```bash
curl -X POST http://localhost:3000/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51999888777",
    "businessName": "Bodega Test",
    "location": "Lima Centro"
  }'

# Guardar el merchantId y apiKey del response
```

### Registrar ventas
```bash
# Usar el apiKey del paso anterior
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_tu_api_key_aqui" \
  -d '{
    "amount": 50.00,
    "paymentMethod": "cash"
  }'
```

### Ver estado de sincronización
```bash
# Revisar DB directamente
sqlite3 ./data/scoredebarrio.db

sqlite> SELECT * FROM sync_status ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 Monitoreo

### Logs
```bash
# Desarrollo
npm run dev  # Logs en consola

# Producción con PM2
pm2 logs score-api
pm2 logs score-sync
```

### Métricas importantes
- Sales registered per minute
- Sync success rate
- Relayer balance (debe tener fondos)
- Failed transactions

---

## 🔒 Seguridad

### API Keys
- Cada comercio tiene un API key único
- Se genera automáticamente en el registro
- **Solo se muestra una vez** - el comercio debe guardarlo

### Rate Limiting
- 100 requests por minuto por IP
- Configurable en `.env`

### Validaciones
- Amounts > 0
- Timestamps válidos
- merchantId existe y está activo

---

## 🐛 Troubleshooting

### "Blockchain not ready"
- Verifica que `RELAYER_PRIVATE_KEY` esté en `.env`
- Verifica que los contract addresses sean correctos
- Verifica que el RPC URL funcione

### "Insufficient funds"
```bash
# Check balance
cast balance TU_RELAYER_ADDRESS --rpc-url https://rpc.sepolia.mantle.xyz

# Si es 0, conseguir fondos en:
https://faucet.sepolia.mantle.xyz
```

### Sync job falla
```bash
# Ver logs detallados
npm run sync

# Verificar gas price
cast gas-price --rpc-url https://rpc.sepolia.mantle.xyz
```

### Database locked
```bash
# Si SQLite se bloquea, reiniciar server
pm2 restart score-api

# O revisar procesos usando la DB
lsof ./data/scoredebarrio.db
```

---

## 📈 Escalabilidad

### Para 100-1000 comercios
- SQLite es suficiente
- 1 worker node

### Para 1000-10000 comercios
- Migrar a PostgreSQL
- Múltiples workers con queue (Bull + Redis)
- Load balancer

### Para 10000+ comercios
- PostgreSQL con replicación
- Microservicios (API separado de Relayer)
- Kubernetes para auto-scaling

---

## 🎯 Roadmap

**v1.0 (Actual)**
- ✅ API REST básica
- ✅ Registro de comercios
- ✅ Registro de ventas
- ✅ Sync manual a blockchain

**v1.1 (Próximo)**
- [ ] Score calculation
- [ ] Dashboard B2B API
- [ ] Webhooks para eventos
- [ ] Stats endpoint mejorado

**v2.0 (Futuro)**
- [ ] GraphQL API
- [ ] Real-time con WebSockets
- [ ] Analytics avanzados
- [ ] Multi-chain support

---

## 📚 Documentación Adicional

- [Mantle Docs](https://docs.mantle.xyz)
- [Smart Contracts](../score-de-barrio/README.md)
- [API Reference](./docs/API.md)

---

## 🤝 Contribuir

```bash
# Fork del repo
git checkout -b feature/nueva-funcionalidad
git commit -m "Descripción del cambio"
git push origin feature/nueva-funcionalidad
# Crear Pull Request
```

---

**¿Problemas?** Abre un issue en GitHub o contacta al equipo.