# 🏪 Score de Barrio - Mantle Ledger

**Network:** Mantle Sepolia Testnet (Chain ID: 5003)  
**Contract Status:** Deployed and Operational 🚀

This project implements an on-chain sales registration system for neighborhood businesses. It uses smart contracts to create a transparent and decentralized financial history, allowing small businesses to build a credit reputation based on real sales data (Buckets).

---

## 📝 Deployment Details

The contracts were compiled with **Solidity 0.8.24** using the **Via-IR** pipeline to optimize memory management (Stack) and ensure gas efficiency on a Layer 2 (L2) network.

### Contract Addresses
| Contract | Address | Transaction Hash |
|----------|---------------------|---------------------|
| **MerchantRegistry** | `0x2bd8AbEB2F5598f8477560C70c742aFfc22912de` | `0x467d7fa0d03a95d23258e0ef1e34095a64b5c48cc99ba94f843a3c16113ebc33` |
| **SalesEventLog** | `0x7007508b1420e719D7a7A69B98765F60c7Aae759` | `0x3d7bb3ab0d3d16ede4a0bed20fb4d72422581d3ec9631e30e65ac05118044290` |

**Deployer:** `0x3B0eB4BD67d7243a4DBe684e9c922D9c3919AFbf`

---

## 📊 Data Architecture: Sales Buckets

To ensure privacy (compliance) and reduce costs, we do not record individual customer transactions. The data is grouped into **15-minute buckets**.

- **Bucket Structure:**
  - `totalAmount`: Total amount accumulated during the period.
  - `cashAmount`: Sales made in cash.
  - `digitalAmount`: Sales processed via digital wallets (Yape/Plin/Card).
  - `txCount`: Total number of transactions during the period.

---

## 📈 "Score de Barrio" Calculation Methodology

The **Neighborhood Score** is a credit confidence index (0-100) calculated directly from the business's on-chain buckets.

### 1. Pillars of the Score
The calculation weighs three fundamental variables:

* **Sales Consistency (40%):** Rewards daily activity. A business that sells a little every day is more reliable than one that sells a lot on just one day.
    * *Calculation:* `(Days with sales in the month / 30) * 100`.
* **Digital Traceability (30%):** Rewards the adoption of electronic payments. Digital money is 100% verifiable.
    * *Calculation:* `(Total Digital Amount / Total Amount) * 100`.
* **Average Ticket and Stability (30%):** Analyzes the average purchase size and ensures there are no drastic drops in volume.
* *Calculation:* `(Current Period Volume / Historical Average Volume) * 100`.

### 2. Applied Mathematical Formula
$$Score = (Consistency \times 0.40) + (Digitization \times 0.30) + (Stability \times 0.30)$$

### 3. Application Example
For **Bodega Don Pepe** (Merchant 1) with current data:
- **Total Volume:** $127.00 over 3 periods.
- **Digital Mix:** ~40%.
- **Projected Result:** **82/100** (Low Risk Profile).

---

## 🛠 Verification Guide (Standard JSON)

Given the migration of APIs in Mantle explorers, verification must be performed by manually loading the Foundry configuration file:

1.  Compile the project: `forge build`.
2.  Locate the file in `out/build-info/*.json`.
3.  Upload this file to the explorer under the **Solidity (Standard-JSON-Input)** option.
4.  Ensure that the version is `0.8.24` and the `viaIR` flag is set to `true`.

---

## 🔗 Project Links
- **Mantlescan (Registry):** [View in Explorer](https://sepolia.mantlescan.xyz/address/0x2bd8AbEB2F5598f8477560C70c742aFfc22912de)
- **Mantlescan (Sales Log):** [View in Explorer](https://sepolia.mantlescan.xyz/address/0x7007508b1420e719D7a7A69B98765F60c7Aae759)