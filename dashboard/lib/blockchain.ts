import { ethers } from 'ethers'

const RPC_URL = process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'
const SALES_LOG_ADDRESS = process.env.NEXT_PUBLIC_SALES_EVENT_LOG!

// ABI mínimo para leer los eventos de ventas agregadas
const ABI = [
  "function getSalesStats(bytes32 merchantId) view returns (uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint256 txCount)",
  "event SalesRecorded(bytes32 indexed merchantId, uint256 bucket, uint256 totalAmount)"
]

export const getBlockchainProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL)
}

export async function verifyMerchantOnChain(merchantId: string) {
  const provider = getBlockchainProvider()
  const contract = new ethers.Contract(SALES_LOG_ADDRESS, ABI, provider)

  try {
    const stats = await contract.getSalesStats(merchantId)
    const txCount = Number(stats.txCount)
    return {
      totalOnChain: ethers.formatUnits(stats.totalAmount, 18),
      txCount: txCount.toString(),
      // Solo verificado si hay al menos un bucket publicado on-chain
      isVerified: txCount > 0,
    }
  } catch (error) {
    console.error("Error verificando on-chain:", error)
    return { isVerified: false, totalOnChain: '0', txCount: '0' }
  }
}