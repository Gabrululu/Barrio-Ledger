const { ethers } = require('ethers');
const { MANTLE_RPC_URL, RELAYER_PRIVATE_KEY, SALES_EVENT_LOG } = process.env;

// ABI mínimo para interactuar con recordSales
const SALES_ABI = [
  "function recordSales(bytes32 merchantId, uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint256 txCount, uint256 bucket) external"
];

const provider = new ethers.JsonRpcProvider(MANTLE_RPC_URL);
const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const salesContract = new ethers.Contract(SALES_EVENT_LOG, SALES_ABI, wallet);

async function sendBucketToBlockchain(data) {
  try {
    console.log(`🔗 Enviando bucket ${data.bucket} para merchant ${data.merchantId}...`);
    
    const tx = await salesContract.recordSales(
      data.merchantId,
      data.totalAmount,
      data.cashAmount,
      data.digitalAmount,
      data.txCount,
      data.bucket
    );

    console.log(`✅ Tx enviada: ${tx.hash}`);
    return await tx.wait(); // Espera confirmación
  } catch (error) {
    console.error("❌ Error en Relayer:", error);
    throw error;
  }
}

module.exports = { sendBucketToBlockchain };