# 🏪 Barrio Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mantle Network](https://img.shields.io/badge/Built%20on-Mantle-green)](https://mantle.xyz)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev)

---

## 📋 Description

**Barrio Ledger** is a decentralized fintech platform that transforms the daily sales of small businesses (grocery stores, neighborhood shops) into a verifiable and immutable credit history using the **Mantle L2** blockchain.

The goal is to **financially include** unbanked businesses, allowing them to access fair credit based on their actual sales behavior, eliminating costly intermediaries and reducing the risk of fraud.

### 🎯 Value proposition

| Stakeholder | Benefit |
|-------------|-----------|
| 🛒 **Salesperson** | Simple tool for recording sales and building a verifiable digital financial score |
| 🏦 **Fintech/Bank** | Access to certified on-chain sales data, reducing fraud risk and acquisition costs |
| ⛓️ **Blockchain** | Real-world use case in L2 (Mantle) demonstrating scalability and cost efficiency |

---

## 🏗️ System Architecture

Barrio Ledger consists of **four independent but integrated layers**::

```
┌─────────────────────────────────────────────────────────┐
│                   DASHBOARD B2B (Next.js)                │
│              Analytics, Maps, Risk Management             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              BACKEND API (Node.js + Express)             │
│         Scoring Engine, Relayer, Data Management         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│          SMART CONTRACTS (Mantle L2 Sepolia)            │
│   MerchantRegistry, SalesEventLog, Scoring Verification │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│            APP PWA (React + Vite + Tailwind)            │
│         Point of Sale, Real-time Sales Registration      │
└─────────────────────────────────────────────────────────┘
```

### 📍 Detailed Components

#### 1. **Smart Contracts** (`/score-de-barrio`)
Solidity contracts on **Mantle Sepolia** that act as an immutable source of truth.

```solidity
// MerchantRegistry.sol
- Single merchant registry
- Public key management
- On-chain activity history

// SalesEventLog.sol
- Sales aggregation storage (buckets)
- Relayer signature verification
- Immutable transaction events
```

**Direcciones Desplegadas:**
- `MerchantRegistry`: `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de`
- `SalesEventLog`: `0x7007508b1420e719D7a7A69B98765F60c7Aae759`
- **Network:** Mantle Sepolia (Chain ID: 5003)

#### 2. **Backend Relayer** (`/backend`)
Central engine that processes sales, calculates scores, and synchronizes with blockchain.

**Features:**
- ✅ **REST API** for warehouse and sales registration
- ✅ **Scoring Engine**: Dynamic scoring algorithm
- ✅ **Automated Relayer**: Aggregates sales in 15-minute buckets and signs them
- ✅ **SQLite Cache**: Local storage for synchronization
- ✅ **PostgreSQL**: Persistence of scores and statistics

**Main Endpoints:**
```
POST   /api/merchants              # Register new store
POST   /api/sales                  # Register sale (requires API Key)
GET    /api/stats/:merchantId      # Check score and metrics
GET    /api/merchants              # List registered stores
GET    /api/sales/:merchantId      # Sales history
```

#### 3. **App PWA** (`/app`)
Ultra-lightweight point-of-sale application optimized for slow connections.

**Features:**
- 📱 Works as a native app (PWA)
- 🔴 Full offline support
- ⚡ Sales registration in 2-3 taps
- 💾 Automatic synchronization when connected
- 🎨 Mobile-first responsive design

#### 4. **Dashboard B2B** (`/dashboard`)
Administrative panel for financial institutions and credit institutions.

**Features:**
- 📊 View scores by business
- 🗺️ Interactive risk map by district
- 📈 Advanced analytics and trends
- ⛓️ Direct verification against blockchain
- 🔐 Secure authentication

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|------|-----------|----------|
| **Blockchain** | Mantle Network (L2), Solidity 0.8.19 | Immutability and security |
| **Smart Contracts** | Foundry, OpenZeppelin Contracts | Testing and development |
| **Backend** | Node.js 18+, Express.js | API and business logic |
| **Local Database** | SQLite | Cache and synchronization |
| **Persistent Database** | PostgreSQL + Prisma | Scores and statistics |
| **Frontend App** | React 18, Vite, Tailwind CSS | Lightweight PWA |
| **Frontend Dashboard** | Next.js 14, TypeScript | Modern admin panel |
| **Monitoring** | PM2 | Process management |
| **DevOps** | GitHub Codespaces, Docker | Development and deployment |

---

## 📊 Scoring Algorithm

The **Score de Barrio** (0-100) is calculated dynamically based on:

```
FINAL SCORE = (40% VOLUME) + (30% CONSISTENCY) + (30% DIGITIZATION)
```

### Breakdown:

| Factor | Weight | Calculation |
|--------|------|---------|
| 📊 **Volume** | 40% | Total amount of normalized sales |
| 📅 **Consistency** | 30% | Consecutive days of registered activity |
| 💳 **Digitization** | 30% | % of sales using digital methods |

**Example:**
- Salesperson with 5,000 soles in monthly sales
- 20 consecutive days of activity
- 60% digital sales
- **Resulting Score:** 78/100 ✅

---

## 🚀 Installation and Configuration

### Prerequisites

```bash
# Check versions
node --version  # v18 or higher
npm --version   # v8 or higher
```

- MetaMask wallet or Mantle Sepolia compatible wallet
- Funds in Mantle Sepolia for the Relayer (0.5 MNT minimum)
- PostgreSQL running locally

### 1️⃣ Configure Backend

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env

# Edit .env with:
# - RELAYER_PRIVATE_KEY (Relayer wallet)
# - DATABASE_URL (PostgreSQL connection)
# - MANTLE_RPC_URL

# Initialize database
npx prisma generate
npx prisma db push

# Start server
npm run dev
# ✅ Backend running at http://localhost:3000
```

### 2️⃣ Launch PWA App

```bash
cd app
npm install
npm run dev
# ✅ App available at http://localhost:5173
```

### 3️⃣ Iniciar Dashboard B2B

```bash
cd dashboard
npm install
npx prisma generate
npm run dev
# ✅ Dashboard disponible en http://localhost:3001
```

### 3️⃣ Start Dashboard B2B

```bash
cd dashboard
npm install
npx prisma generate
npm run dev
# ✅ Dashboard available at http://localhost:3001
```

### 4️⃣ Deploy Smart Contracts (Optional)

```bash
cd score-de-barrio
# Install Foundry if you don't have it: curl -L https://foundry.paradigm.xyz | bash
source $HOME/.bashrc

# Compile contracts
forge build

# Deploy to Mantle Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --private-key <YOUR_PRIVATE_KEY> \
  --broadcast
```

---

## 📝 Use Cases

### Case 1: Merchant Records Daily Sales
1. Open the Score de Barrio app
2. Tap “Record Sale”
3. Select Cash/Digital
4. Enter amount (50, 100, 200 soles)
5. ✅ Sale synchronized (offline if necessary)
6. Your score is updated in real time

### Case 2: Bank Checks Credit Risk
1. Access the Dashboard as a financial institution
2. Search for a store by location or name
3. View score, trends, history
4. **Verify on-chain** that the data is authentic
5. Make credit decisions based on real data

### Case 3: Regional Risk Analysis
1. Risk manager opens Dashboard
2. Activates filter by district (e.g., “Miraflores”)
3. View heat map with scores
4. Identify credit portfolio opportunities
5. Export analytical reports

---

## 🔐 Security

### Measures Implemented

✅ **Cryptographic Signatures**: Relayer signs aggregations with private key  
✅ **On-chain Verification**: All data verifiable against blockchain  
✅ **Rate Limiting**: 100 requests/minute per API Key  
✅ **HTTPS Mandatory**: In production, all connections encrypted  
✅ **Transaction Auditing**: Immutable logs on blockchain  

---

## 📈 Roadmap

### ✅ Phase 1 (Completed)
- [x] Smart Contracts on Mantle Sepolia
- [x] Backend API with Scoring Engine
- [x] Functional PWA App
- [x] Basic B2B Dashboard
- [x] Automatic On-chain Synchronization

### 🔄 Phase 2 (In Development)
- [ ] Integration with QR payment gateways
- [ ] ML scoring based on historical patterns
- [ ] Multi-chain (expand to other L2s)

### 🎯 Phase 3 (Roadmap)
- [ ] DeFi Lending Pool: Automatic loans via Smart Contracts
- [ ] Data Marketplace: Sale of aggregated insights
- [ ] Tokenization: MNT rewards for good credit behavior
- [ ] Native banking integration

---

## 📱 Deployment URLs

| Component | URL |
|-----------|-----|
| **App PWA** | https://barrio-ledger-app.vercel.app/ |
| **Dashboard** | https://barrio-ledger-dashboard.vercel.app/ |
| **Backend API** | https://barrio-ledger-backend.up.railway.app |
| **Blockchain (Mantle)** | https://sepolia.mantlescan.xyz |

---

## 📧 Contact and Support

- **GitHub**: [@Gabrululu](https://github.com/Gabrululu)
- **Issues**: [Report bugs here](https://github.com/Gabrululu/Barrio-Ledger/issues)
- **Documentation**: [Ver Wiki](https://github.com/Gabrululu/Barrio-Ledger/wiki)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Developed for the Mantle Global Hackathon** 🚀

*Transforming warehouses into verifiable financial assets*
