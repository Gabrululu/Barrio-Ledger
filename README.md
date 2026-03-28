
# Barrio Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mantle Network](https://img.shields.io/badge/Built%20on-Mantle-green)](https://mantle.xyz)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

**Barrio Ledger** is a decentralized fintech platform that transforms the daily sales of small businesses (grocery stores, neighborhood shops) into a verifiable and immutable credit history using the **Mantle L2** blockchain.

The goal is to **financially include** unbanked businesses, giving them access to fair credit based on their actual sales behavior — no costly intermediaries, fully verifiable on-chain.

---

## Value Proposition

| Stakeholder | Benefit |
|-------------|---------|
| **Merchant** | Simple tool to log sales and build a verifiable financial score |
| **Fintech / Bank** | Access to certified on-chain sales data, reducing fraud risk and origination costs |
| **Blockchain** | Real-world L2 use case (Mantle) demonstrating scalability and cost efficiency |

---

## System Architecture

Barrio Ledger has **three** independent but integrated layers:

```
┌─────────────────────────────────────────────────────────┐
│            UNIFIED FRONTEND (Next.js 14)                │
│                                                         │
│  /            → Landing page                            │
│  /comerciante → PWA app for merchants                   │
│  /dashboard   → B2B panel for institutions              │
│                                                         │
│  Deployed on: Vercel (single project)                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              BACKEND API (Node.js + Express)             │
│     Scoring Engine · Relayer · SQLite · PostgreSQL       │
│                                                         │
│  Deployed on: Railway                                   │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│          SMART CONTRACTS (Mantle L2 Sepolia)            │
│      MerchantRegistry · SalesEventLog                   │
└─────────────────────────────────────────────────────────┘
```

### Frontend Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page — choose your profile | Public |
| `/comerciante` | Merchant PWA (registration + sales + score) | Public |
| `/login` | B2B access for institutions | Public |
| `/dashboard` | Overview with KPIs and charts | Required |
| `/merchants` | Merchant list and search | Required |
| `/map` | District risk map | Required |
| `/analytics` | Advanced analytics | Required |
| `/api-keys` | API Key management | Required |

---

## Components

### Smart Contracts (`/score-de-barrio`)

Solidity contracts on **Mantle Sepolia** as the immutable source of truth.

```
MerchantRegistry.sol  — Single merchant registry
SalesEventLog.sol     — Aggregated sales storage (15-min buckets)
```

**Deployed contracts:**
- `MerchantRegistry`: `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de`
- `SalesEventLog`: `0x7007508b1420e719D7a7A69B98765F60c7Aae759`
- **Network:** Mantle Sepolia (Chain ID: 5003)

### Backend Relayer (`/backend`)

Central engine that processes sales, calculates scores, and syncs with the blockchain.

**Main endpoints:**
```
POST  /api/merchants              # Register a new merchant
POST  /api/sales                  # Record a sale (requires API Key)
POST  /api/sales/batch            # Bulk recording (max 100)
GET   /api/stats/:merchantId      # Score and metrics
GET   /api/merchants              # List merchants
GET   /api/sales/merchant/:id     # Sales history
GET   /health                     # Service status and relayer balance
```

### Unified Frontend (`/dashboard`)

Next.js 14 with TypeScript that combines the merchant app and the B2B panel into a single project.

**Merchant App (`/comerciante`):**
- Installable PWA on mobile (manifest.json + icons)
- Sale registration in 2–3 taps (cash or digital)
- Real-time on-chain score
- Transaction history with sync status
- Mobile-first design, works on low-bandwidth connections

**B2B Dashboard (`/dashboard` and subroutes):**
- Scores and metrics per merchant
- District heat map (Leaflet)
- Trend charts (Recharts)
- Direct on-chain verification
- NextAuth authentication — credentials via environment variables

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Blockchain** | Mantle Network L2, Solidity | 0.8.24 |
| **Smart Contracts** | Foundry, OpenZeppelin | Latest |
| **Backend** | Node.js, Express.js | ≥20.19.0 |
| **Local database** | SQLite (better-sqlite3) | Cache & sync |
| **Persistent database** | PostgreSQL + Prisma | 6.1.0 |
| **Frontend** | Next.js, TypeScript, Tailwind CSS | 14.0.4 |
| **Web3** | ethers.js | 6.16.0 |
| **Auth** | NextAuth.js | 4.24.13 |
| **Charts** | Recharts | 2.15.4 |
| **Maps** | Leaflet + react-leaflet | 1.9.4 |
| **Process manager** | PM2 | Production |

---

## Scoring Algorithm

The **Score de Barrio** (0–100) is calculated dynamically:

```
FINAL SCORE = (40% VOLUME) + (30% CONSISTENCY) + (30% DIGITIZATION)
```

| Factor | Weight | Calculation | Target |
|--------|--------|-------------|--------|
| **Volume** | 40% | Total sales / USD 1,000 | USD 1,000 = 40 pts |
| **Consistency** | 30% | Unique buckets / 10 | 10 buckets = 30 pts |
| **Digitization** | 30% | (Digital sales / Total) × 30 | 100% digital = 30 pts |

**Ratings:**
- Score ≥ 70 → `Excellent`
- Score 40–69 → `Good`
- Score < 40 → `Risky`

---

## Local Setup

### Requirements

```bash
node --version  # v20 or higher
npm --version   # v8 or higher
```

### 1. Backend

```bash
cd backend
npm install

cp .env.example .env
# Fill in .env with:
#   RELAYER_PRIVATE_KEY  — relayer wallet private key
#   DATABASE_URL         — PostgreSQL connection string
#   API_KEY_SALT         — openssl rand -hex 32
#   JWT_SECRET           — openssl rand -hex 32

npx prisma generate
npx prisma db push

npm run dev
# Backend running at http://localhost:3000
```

### 2. Frontend (Landing + Merchant App + B2B Dashboard)

```bash
cd dashboard
npm install

cp .env.example .env.local
# Fill in .env.local with:
#   NEXT_PUBLIC_API_URL  — backend URL (Railway or http://localhost:3000/api)
#   NEXTAUTH_SECRET      — openssl rand -hex 32
#   NEXTAUTH_URL         — public frontend URL
#   ADMIN_EMAIL          — dashboard admin email
#   ADMIN_PASSWORD       — secure password

npx prisma generate

npm run dev
# App available at http://localhost:3000
#   /             → Landing
#   /comerciante  → Merchant app
#   /login        → B2B access
```

### 3. Smart Contracts (optional — already deployed)

```bash
cd score-de-barrio
# Install Foundry: curl -L https://foundry.paradigm.xyz | bash

forge build
forge test -vvv

# Deploy to Mantle Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key <YOUR_PRIVATE_KEY> \
  --broadcast
```

---

## Production Deployment

### Frontend → Vercel

One project pointing to the `dashboard/` directory.

Required environment variables in Vercel:
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SALES_EVENT_LOG
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
```

### Backend → Railway

Required environment variables in Railway:
```
PORT
NODE_ENV=production
DATABASE_URL
RELAYER_PRIVATE_KEY
MERCHANT_REGISTRY
SALES_EVENT_LOG
API_KEY_SALT
JWT_SECRET
MANTLE_RPC_URL
```

### Production URLs

| Component | URL |
|-----------|-----|
| **Frontend (Landing + App + Dashboard)** | https://barrio-ledger.vercel.app |
| **Backend API** | https://barrio-ledger-backend.up.railway.app |
| **Blockchain Explorer** | https://sepolia.mantlescan.xyz |

---

## Usage Flows

### Merchant records sales
1. Open `scoredebarrio.com/comerciante` or install the PWA
2. Enter phone number, business name, and location
3. Tap "Record Sale" → select payment method → enter amount
4. The backend aggregates the sale into a 15-minute bucket
5. The relayer signs and publishes the bucket to Mantle Sepolia
6. The score updates automatically

### Institution evaluates risk
1. Log in at `/login` with admin credentials
2. Search for a merchant by name or location
3. Review score, trends, and history
4. Verify data authenticity on-chain directly from the dashboard
5. Make a credit decision based on real, immutable data

---

## Security

- All credentials are managed exclusively through environment variables — never hardcoded
- `.env.example` files with placeholders in every subproject
- Dashboard authentication via NextAuth — credentials stored in environment variables
- Next.js middleware protects all B2B routes
- Rate limiting: 100 req/min per API Key
- Privacy by design: only the SHA-256 hash of the merchant's phone number is stored
- Cryptographic relayer signatures for every batch published on-chain

---

## Roadmap

### Phase 1 — Completed
- [x] Smart Contracts on Mantle Sepolia
- [x] Backend API with Scoring Engine and Relayer
- [x] Merchant PWA integrated into the unified frontend
- [x] B2B Dashboard with map, analytics, and on-chain verification
- [x] Automatic on-chain sync every 15 minutes
- [x] Secure authentication with NextAuth
- [x] Landing page with role-based access paths

### Phase 2 — In Progress
- [ ] QR payment gateway integration
- [ ] ML-based scoring from historical patterns
- [ ] Multi-chain support (other L2s)

### Phase 3 — Roadmap
- [ ] DeFi Lending Pool: automatic loans via Smart Contracts
- [ ] Data Marketplace: sale of aggregated insights
- [ ] Tokenization: MNT rewards for good credit behavior
- [ ] Native banking integration

---

## Contact

- **GitHub**: [@Gabrululu](https://github.com/Gabrululu)
- **Issues**: [Report a bug](https://github.com/Gabrululu/Barrio-Ledger/issues)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for the Mantle Global Hackathon — Turning neighborhood stores into verifiable financial assets*
