# 🏗️ Barrio Ledger - Backend API

Backend/Relayer for Barrio Ledger. Adds merchant sales and synchronizes them with smart contracts on Mantle Sepolia.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the project
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your values
```
### 2. Configuration

Edit `.env` with:
- `RELAYER_PRIVATE_KEY`: Your private key (requires funds in Mantle Sepolia)
- `MERCHANT_REGISTRY`: MerchantRegistry contract address
- `SALES_EVENT_LOG`: SalesEventLog contract address

### 3. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will be at `http://localhost:3000`

---

## 📋 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  “status”: “ok”,
  “blockchain”: {
    “ready”: true,
    “balance”: “0.5”,
    “blockNumber”: 33367800
  }
}
```

### Register Merchant
```bash
POST /api/merchants
Content-Type: application/json

{
  “phone”: “+51987654321”,
  “businessName”: “Bodega Don Pepe”,
  “location”: “Miraflores, Lima”
}

Response:
{
  “success”: true,
  “merchant”: {
    “id”: “uuid-...”,
    “merchantId”: “0x265...”,
    “apiKey”: “sk_abc123...”  # ⚠️ Save, not displayed again
  },
  “blockchain”: {
    “status”: “submitted”,
    “txHash”: “0x467...”
  }
}
```

### Register Sale
```bash
POST /api/sales
Content-Type: application/json
X-API-Key: sk_abc123...

{
  "amount": 25.50,
  "paymentMethod": "cash",  # or "digital"
  "timestamp": 1768279853   # optional
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

### Record Sales in Batch
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

### View Sales for a Business
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

## 🔄 Synchronization with Blockchain

### Manual (for testing)
```bash
npm run sync
```

### Automatic (production)

Option 1: System cron
```bash
# Edit crontab
crontab -e

# Add line (every 15 minutes)
*/15 * * * * cd /path/to/backend && npm run sync >> /var/log/sync.log 2>&1
```

Option 2: PM2 with cron
```bash
npm install -g pm2

# Start server
pm2 start src/server.js --name "score-api"

# Start sync job (each 15 min)
pm2 start src/jobs/syncBuckets.js --name "score-sync" --cron "*/15 * * * *" --no-autorestart
```

---

## 🗄️ Database

The backend uses **SQLite** for simplicity. Data is stored in `./data/scoredebarrio.db`

### Tables:

**merchants**: Registered merchants
- `merchant_id`: On-chain ID (bytes32)
- `api_key`: For authentication
- `business_name`, `location`: Business information

**sales**: Registered sales
- `merchant_id`: Business that made the sale
- `amount_cents`: Amount in cents
- `payment_method`: “cash” or “digital”
- `bucket`: Time bucket (to add)
- `synced`: If already sent to the blockchain

**sync_status**: Synchronization status
- `merchant_id`, `bucket`: Unique identifier
- `tx_hash`: Transaction hash
- `status`: pending/submitted/confirmed/failed

### Backup
```bash
# Manual Backup
cp ./data/scoredebarrio.db ./backups/backup-$(date +%Y%m%d).db

#Automatic backup (daily cron)
0 2 * * * cp /path/to/data/scoredebarrio.db /path/to/backups/backup-$(date +\%Y\%m\%d).db
```

---

## 🧪 Testing

### Register test trade
```bash
curl -X POST http://localhost:3000/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+51999888777",
    "businessName": "Bodega Test",
    "location": "Lima Centro"
  }'

# Save the merchantId and apiKey from the response
```

### Record sales
```bash
# Use the apiKey from the previous step
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_tu_api_key_here" \
  -d '{
    "amount": 50.00,
    "paymentMethod": "cash"
  }'
```

### View synchronization status
```bash
# Check DB directly
sqlite3 ./data/scoredebarrio.db

sqlite> SELECT * FROM sync_status ORDER BY created_at DESC LIMIT 5;
```

---

## 📊 Monitoring

### Logs
```bash
# Development
npm run dev  # Console logs

# Production with PM2
pm2 logs score-api
pm2 logs score-sync
```

### Important metrics
- Sales registered per minute
- Sync success rate
- Relayer balance (must have funds)
- Failed transactions

---

## 🔒 Security

### API Keys
- Each merchant has a unique API key
- It is automatically generated upon registration
- **It is only displayed once** - the merchant must save it

### Rate Limiting
- 100 requests per minute per IP
- Configurable in `.env`

### Validations
- Amounts > 0
- Valid timestamps
- merchantId exists and is active

---

## 🐛 Troubleshooting

### "Blockchain not ready"
- Verify that `RELAYER_PRIVATE_KEY` is in `.env`
- Verify that the contract addresses are correct
- Verify that the RPC URL works

### "Insufficient funds"
```bash
# Check balance
cast balance TU_RELAYER_ADDRESS --rpc-url https://rpc.sepolia.mantle.xyz

# If it is 0, obtain funds at:
https://faucet.sepolia.mantle.xyz
```

### Sync job falla
```bash
# View detailed logs
npm run sync

# Check gas price
cast gas-price --rpc-url https://rpc.sepolia.mantle.xyz
```

### Database locked
```bash
# If SQLite crashes, restart server
pm2 restart score-api

# Or review processes using the DB
lsof ./data/scoredebarrio.db
```

---

## 📈 Scalability

### For 100-1000 merchants
- SQLite is sufficient
- 1 worker node

### For 1000-10000 merchants
- Migrate to PostgreSQL
- Multiple workers with queue (Bull + Redis)
- Load balancer

### For 10,000+ merchants
- PostgreSQL with replication
- Microservices (API separate from Relayer)
- Kubernetes for auto-scaling

---

## 🎯 Roadmap

**v1.0 (Current)**
- ✅ Basic REST API
- ✅ Merchant registration
- ✅ Sales registration
- ✅ Manual sync to blockchain

**v1.1 (Coming soon)**
- [ ] Score calculation
- [ ] B2B API dashboard
- [ ] Webhooks for events
- [ ] Improved stats endpoint

**v2.0 (Future)**
- [ ] GraphQL API
- [ ] Real-time with WebSockets
- [ ] Advanced analytics
- [ ] Multi-chain support

---

## 📚 Additional Documentation

- [Mantle Docs](https://docs.mantle.xyz)
- [Smart Contracts](../score-de-barrio/README.md)
- [API Reference](./docs/API.md)

---

## 🤝 Contribute

```bash
# Fork the repo
git checkout -b feature/new-functionality
git commit -m “Description of the change”
git push origin feature/new-functionality
# Create Pull Request
```

---

**Problems?** Open an issue on GitHub or contact the team.