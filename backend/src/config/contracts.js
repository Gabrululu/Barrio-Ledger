const { ethers } = require('ethers');
const { wallet, config } = require('./blockchain');

// Minimal ABIs (only the functions we need)
const MERCHANT_REGISTRY_ABI = [
  "function register(bytes32 merchantId, string businessName, string location) external",
  "function updateMerchant(bytes32 merchantId, string businessName, string location) external",
  "function deactivateMerchant(bytes32 merchantId) external",
  "function merchantOwner(bytes32 merchantId) external view returns (address)",
  "function isActive(bytes32 merchantId) external view returns (bool)",
  "function getMerchantInfo(bytes32 merchantId) external view returns (tuple(bool isActive, string businessName, string location, uint256 registeredAt))",
  "function getTotalMerchants() external view returns (uint256)",
];

const SALES_EVENT_LOG_ABI = [
  "function recordSales(bytes32 merchantId, uint256 timestamp, uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint8 txCount) external",
  "function recordSalesBatch(bytes32 merchantId, uint256[] timestamps, uint256[] totalAmounts, uint256[] cashAmounts, uint256[] digitalAmounts, uint8[] txCounts) external",
  "function getSalesBucket(bytes32 merchantId, uint256 bucket) external view returns (tuple(uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint8 txCount, bool exists))",
  "function getCurrentBucket() external view returns (uint256)",
  "function getSalesStats(bytes32 merchantId, uint256 startBucket, uint256 endBucket) external view returns (tuple(uint256 totalSales, uint256 totalTransactions, uint256 averageTicket, uint256 cashPercentage, uint256 digitalPercentage))",
  "function getMerchantBucketCount(bytes32 merchantId) external view returns (uint256)",
];

// Create contract instances
let merchantRegistry = null;
let salesEventLog = null;

if (wallet && config.contracts.merchantRegistry && config.contracts.salesEventLog) {
  try {
    merchantRegistry = new ethers.Contract(
      config.contracts.merchantRegistry,
      MERCHANT_REGISTRY_ABI,
      wallet
    );

    salesEventLog = new ethers.Contract(
      config.contracts.salesEventLog,
      SALES_EVENT_LOG_ABI,
      wallet
    );

    console.log('✓ Contract instances created');
  } catch (error) {
    console.error('✗ Failed to create contract instances:', error.message);
  }
}

// Helper: Generate merchant ID from phone hash
function generateMerchantId(phoneHash) {
  return ethers.keccak256(ethers.toUtf8Bytes(phoneHash));
}

// Helper: Calculate bucket from timestamp
function calculateBucket(timestamp) {
  const BUCKET_DURATION = parseInt(process.env.BUCKET_DURATION) || 900; // 15 minutes
  return Math.floor(timestamp / BUCKET_DURATION);
}

// Helper: Get current bucket
function getCurrentBucket() {
  return calculateBucket(Math.floor(Date.now() / 1000));
}

module.exports = {
  merchantRegistry,
  salesEventLog,
  MERCHANT_REGISTRY_ABI,
  SALES_EVENT_LOG_ABI,
  generateMerchantId,
  calculateBucket,
  getCurrentBucket,
};