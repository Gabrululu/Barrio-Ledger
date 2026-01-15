# 📚 Score de Barrio Backend - Ejemplos de Uso

## 🎯 Flujo Completo: Desde Registro hasta Blockchain

### 1. Registrar un Nuevo Comercio

```bash
curl -X POST http://localhost:3000/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51987654321",
    "businessName": "Bodega San Miguel",
    "location": "San Miguel, Lima"
  }'
```

**Response:**
```json
{
  "success": true,
  "merchant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "merchantId": "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    "businessName": "Bodega San Miguel",
    "location": "San Miguel, Lima",
    "apiKey": "sk_7f3c9a8b1e2d4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e"
  },
  "blockchain": {
    "status": "submitted",
    "txHash": "0xabc123def456..."
  },
  "message": "Merchant registered successfully. Save your API key - it will not be shown again."
}
```

⚠️ **IMPORTANTE**: Guarda el `apiKey` - solo se muestra una vez.

---

### 2. Registrar Ventas a lo Largo del Día

```bash
# Guardar API key como variable
API_KEY="sk_7f3c9a8b1e2d4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e"

# Venta 1: 8:30 AM - $15.50 en efectivo
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "amount": 15.50,
    "paymentMethod": "cash"
  }'

# Venta 2: 9:15 AM - $8.75 digital (Yape)
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "amount": 8.75,
    "paymentMethod": "digital"
  }'

# Venta 3: 10:00 AM - $25.00 en efectivo
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "amount": 25.00,
    "paymentMethod": "cash"
  }'
```

**Response típico:**
```json
{
  "success": true,
  "sale": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "merchantId": "0x7f8a9b2...",
    "amount": 15.50,
    "amountCents": 1550,
    "paymentMethod": "cash",
    "bucket": 1964755,
    "timestamp": 1768280400
  },
  "sync": {
    "status": "pending",
    "willSyncAt": "2024-01-13T09:45:00Z",
    "message": "Sale recorded. Will be synced to blockchain in the next bucket."
  }
}
```

---

### 3. Registrar Ventas en Lote (Más Eficiente)

Si tienes múltiples ventas acumuladas:

```bash
curl -X POST http://localhost:3000/api/sales/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "sales": [
      {"amount": 5.00, "paymentMethod": "cash"},
      {"amount": 12.50, "paymentMethod": "digital"},
      {"amount": 8.25, "paymentMethod": "cash"},
      {"amount": 15.75, "paymentMethod": "digital"},
      {"amount": 20.00, "paymentMethod": "cash"}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "inserted": 5,
  "errors": 0,
  "results": [
    {"id": "uuid-1", "amount": 5.00, "bucket": 1964755},
    {"id": "uuid-2", "amount": 12.50, "bucket": 1964755},
    {"id": "uuid-3", "amount": 8.25, "bucket": 1964755},
    {"id": "uuid-4", "amount": 15.75, "bucket": 1964755},
    {"id": "uuid-5", "amount": 20.00, "bucket": 1964755}
  ],
  "errors": []
}
```

---

### 4. Ver Historial de Ventas

```bash
# Ver últimas 50 ventas
curl http://localhost:3000/api/sales/merchant/0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a

# Con paginación
curl "http://localhost:3000/api/sales/merchant/0x7f8a9b2c...?limit=20&offset=0"
```

**Response:**
```json
{
  "sales": [
    {
      "id": "uuid-...",
      "amount": 15.50,
      "amount_cents": 1550,
      "payment_method": "cash",
      "bucket": 1964755,
      "synced": true,
      "created_at": 1768280400
    },
    {
      "id": "uuid-...",
      "amount": 8.75,
      "amount_cents": 875,
      "payment_method": "digital",
      "bucket": 1964755,
      "synced": true,
      "created_at": 1768281300
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

### 5. Sincronizar con Blockchain (Manual)

```bash
# Ejecutar sincronización manualmente
npm run sync
```

**Output esperado:**
```
═══════════════════════════════════════
Starting bucket sync job...
Time: 2024-01-13T09:45:23.456Z
═══════════════════════════════════════

Current bucket: 1964756
Found 2 bucket(s) to sync

Processing: Merchant 0x7f8a9b2... Bucket 1964755
  Amount: $49.25 (3 txs)
  Cash: $40.50, Digital: $8.75
  📤 Sending transaction...
  ⏳ TX Hash: 0xdef789abc123...
  ⏳ Waiting for confirmation...
  ✓ Transaction confirmed!

Processing: Merchant 0xabc456def... Bucket 1964754
  Amount: $127.00 (8 txs)
  Cash: $76.20, Digital: $50.80
  📤 Sending transaction...
  ⏳ TX Hash: 0x123abc456def...
  ⏳ Waiting for confirmation...
  ✓ Transaction confirmed!

═══════════════════════════════════════
Sync job complete
✓ Success: 2
✗ Failed: 0
═══════════════════════════════════════
```

---

### 6. Ver Info del Comercio

```bash
curl http://localhost:3000/api/merchants/0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

**Response:**
```json
{
  "merchant": {
    "merchant_id": "0x7f8a9b2...",
    "business_name": "Bodega San Miguel",
    "location": "San Miguel, Lima",
    "is_active": 1,
    "created_at": 1768279853,
    "synced_at": 1768281600
  },
  "blockchain": {
    "isActive": true,
    "registeredAt": 1768279859
  }
}
```

---

## 🔄 Flujo Automático con Cron

### Setup Cron (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Agregar línea para sync cada 15 minutos
*/15 * * * * cd /path/to/score-de-barrio-backend && npm run sync >> /var/log/score-sync.log 2>&1
```

### Logs de Sync

```bash
# Ver últimos syncs
tail -f /var/log/score-sync.log

# Ver solo errores
grep "✗" /var/log/score-sync.log
```

---

## 🧪 Testing End-to-End

### Script Completo de Testing

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "1. Health check..."
curl $API_URL/health | jq

echo -e "\n2. Registrando comercio..."
RESPONSE=$(curl -s -X POST $API_URL/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51999000111",
    "businessName": "Bodega Test E2E",
    "location": "Lima Test"
  }')

echo $RESPONSE | jq

# Extraer API key
API_KEY=$(echo $RESPONSE | jq -r '.merchant.apiKey')
MERCHANT_ID=$(echo $RESPONSE | jq -r '.merchant.merchantId')

echo "API Key: $API_KEY"
echo "Merchant ID: $MERCHANT_ID"

echo -e "\n3. Registrando 5 ventas..."
for i in {1..5}; do
  AMOUNT=$((RANDOM % 50 + 10))
  METHOD=$([ $((RANDOM % 2)) -eq 0 ] && echo "cash" || echo "digital")
  
  curl -s -X POST $API_URL/api/sales \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"amount\": $AMOUNT, \"paymentMethod\": \"$METHOD\"}" \
    | jq -c '{amount: .sale.amount, method: .sale.paymentMethod, bucket: .sale.bucket}'
  
  sleep 1
done

echo -e "\n4. Ver historial..."
curl -s "$API_URL/api/sales/merchant/$MERCHANT_ID?limit=10" | jq

echo -e "\n5. Sincronizar (esperar 5 seg)..."
sleep 5
npm run sync

echo -e "\n6. Verificar en blockchain..."
# Aquí puedes usar cast para verificar on-chain

echo -e "\nTest complete!"
```

---

## 📊 Monitoreo en Producción

### Verificar Estado del Relayer

```bash
# Balance del relayer
cast balance TU_RELAYER_ADDRESS --rpc-url https://rpc.sepolia.mantle.xyz

# Gas price actual
cast gas-price --rpc-url https://rpc.sepolia.mantle.xyz

# Último bloque
cast block-number --rpc-url https://rpc.sepolia.mantle.xyz
```

### Verificar Datos en Blockchain

```bash
# Ver total de comercios
cast call 0x2bd8AbEB2F5598f8477560C70c742aFfc22912de \
  "getTotalMerchants()" \
  --rpc-url https://rpc.sepolia.mantle.xyz

# Ver bucket de un comercio
cast call 0x7007508b1420e719D7a7A69B98765F60c7Aae759 \
  "getSalesBucket(bytes32,uint256)" \
  $MERCHANT_ID \
  1964755 \
  --rpc-url https://rpc.sepolia.mantle.xyz
```

---

## 🐛 Debugging

### Ver Estado de la Base de Datos

```bash
sqlite3 ./data/scoredebarrio.db

# Contar ventas por estado
sqlite> SELECT synced, COUNT(*) FROM sales GROUP BY synced;

# Ver últimos syncs
sqlite> SELECT * FROM sync_status ORDER BY created_at DESC LIMIT 5;

# Ver comercios activos
sqlite> SELECT merchant_id, business_name FROM merchants WHERE is_active = 1;
```

### Test de Conexión Blockchain

```bash
node -e "
const { provider } = require('./src/config/blockchain');
provider.getBlockNumber().then(n => console.log('Block:', n));
"
```

---

## 🚀 Deploy a Producción

### Usando PM2

```bash
# Instalar PM2
npm install -g pm2

# Start API
pm2 start src/server.js --name score-api

# Start sync job (cada 15 min)
pm2 start src/jobs/syncBuckets.js \
  --name score-sync \
  --cron "*/15 * * * *" \
  --no-autorestart

# Ver logs
pm2 logs

# Monitoreo
pm2 monit

# Auto-start en reboot
pm2 startup
pm2 save
```

---

**¿Más ejemplos?** Revisa el código fuente en `src/routes/` para ver todas las opciones.