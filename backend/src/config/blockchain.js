const { ethers } = require('ethers');
require('dotenv').config();

// Mantle Sepolia configuration
const config = {
  rpcUrl: process.env.MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz',
  chainId: parseInt(process.env.CHAIN_ID) || 5003,
  contracts: {
    merchantRegistry: process.env.MERCHANT_REGISTRY,
    salesEventLog: process.env.SALES_EVENT_LOG,
  },
};

// Validate configuration
if (!process.env.RELAYER_PRIVATE_KEY) {
  console.warn('⚠️  RELAYER_PRIVATE_KEY not set - blockchain features disabled');
}

if (!config.contracts.merchantRegistry || !config.contracts.salesEventLog) {
  console.warn('⚠️  Contract addresses not set - blockchain features disabled');
}

// Create provider
const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// Create wallet (relayer)
let wallet = null;
if (process.env.RELAYER_PRIVATE_KEY) {
  try {
    wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
    console.log('✓ Relayer wallet initialized:', wallet.address);
  } catch (error) {
    console.error('✗ Failed to initialize wallet:', error.message);
  }
}

// Helper: Check if blockchain is ready
function isBlockchainReady() {
  return wallet !== null && 
         config.contracts.merchantRegistry && 
         config.contracts.salesEventLog;
}

// Helper: Get current block number
async function getCurrentBlock() {
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error('Failed to get block number:', error.message);
    return null;
  }
}

// Helper: Get wallet balance
async function getRelayerBalance() {
  if (!wallet) return null;
  
  try {
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get balance:', error.message);
    return null;
  }
}

// Helper: Wait for transaction confirmation
async function waitForTransaction(txHash, confirmations = 1) {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error.message);
    return null;
  }
}

module.exports = {
  provider,
  wallet,
  config,
  isBlockchainReady,
  getCurrentBlock,
  getRelayerBalance,
  waitForTransaction,
};