import { ethers } from 'ethers';

const RPC_URL = 'https://rpc.sepolia.mantle.xyz';
const SALES_LOG_ADDRESS = "0x7007508b1420e719D7a7A69B98765F60c7Aae759";

const ABI = [
  "function getSalesStats(bytes32 merchantId) view returns (uint256 totalAmount, uint256 cashAmount, uint256 digitalAmount, uint256 txCount)",
  "function getMerchant(string id) view returns (string name, string location, uint256 score, bool exists)"
];

export const getBlockchainProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export async function verifyMerchantOnChain(merchantId) {
  const provider = getBlockchainProvider();
  const contract = new ethers.Contract(SALES_LOG_ADDRESS, ABI, provider);
  
  try {        
    const formattedId = ethers.isHexString(merchantId) 
      ? ethers.zeroPadValue(merchantId, 32) 
      : ethers.id(merchantId);

    const stats = await contract.getSalesStats(formattedId);
    
    return {
      totalOnChain: ethers.formatUnits(stats.totalAmount, 18),
      txCount: stats.txCount.toString(),      
      isVerified: Number(stats.txCount) > 0 
    };
  } catch (error) {
    console.error("Error verificando on-chain:", error);
    return { isVerified: false, totalOnChain: "0", txCount: "0" };
  }
}

export async function getOnChainMerchant(id) {
    const provider = getBlockchainProvider();
    const REGISTRY_ADDRESS = "0x2bd8AbEB2F5598f8477560C70c742aFfc22912de";
    const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, provider);
    try {
        return await contract.getMerchant(id);
    } catch (error) {
        return { exists: false };
    }
}