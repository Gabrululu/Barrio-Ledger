// Configuración de red y contratos para Mantle Sepolia
export const MANTLE_RPC: string = "https://rpc.sepolia.mantle.xyz";
export const MERCHANT_REGISTRY_ADDR: string = "0x2bd8AbEB2F5598f8477560C70c742aFfc22912de";
export const SALES_EVENT_LOG_ADDR: string = "0x7007508b1420e719D7a7A69B98765F60c7Aae759";

// ABI en formato Human-Readable para Ethers.js
export const MERCHANT_REGISTRY_ABI: string[] = [
  "function getMerchant(string id) view returns (string name, string location, uint256 score, bool exists)"
];

export const SALES_EVENT_LOG_ABI: string[] = [
  "function getMerchantStats(string merchantId) view returns (uint256 totalAmount, uint256 txCount, uint256 digitalVolume)"
];
