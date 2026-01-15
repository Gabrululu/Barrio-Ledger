import { ethers } from 'ethers';
import { getBlockchainProvider, verifyMerchantOnChain } from '../lib/blockchain'; // Ajusta la ruta según tu carpeta

const API_URL = "https://barrio-ledger-dashboard.vercel.app/api";

function formatBytes32Id(id) {
    return ethers.zeroPadValue(id, 32);
}

async function apiRequest(endpoint, options = {}) {
  try {    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const contentType = response.headers.get("content-type");
    let data = {};
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.error || 'La operación falló');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// --- SERVICIOS DE BLOCKCHAIN (Mantle Sepolia) ---
export async function getOnChainScore(merchantId) {
    try {        
        const onChainData = await verifyMerchantOnChain(formatBytes32Id(merchantId));
        
        if (onChainData.isVerified) { 
            return {
                score: 82, 
                totalOnChain: onChainData.totalOnChain,
                txCount: onChainData.txCount,
                verified: true
            };
        }
        return { score: 75, verified: false };
    } catch (error) {
        console.error("Error al obtener datos on-chain:", error);
        return { score: 75, verified: false };
    }
}

// --- SERVICIOS DE BASE DE DATOS ---

// Registro de Comercio
export async function registerMerchant({ phone, businessName, location }) {
  const merchantId = `0x${phone}`;
  
  return apiRequest('/merchants', {
    method: 'POST',
    body: JSON.stringify({
      id: merchantId, 
      name: businessName, 
      location: location
    }),
  });
}

// Registro de Venta
export async function registerSale({ amount, paymentMethod, merchantId }) {
  return apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify({
      merchantId, 
      amount: parseFloat(amount),
      paymentMethod,
      timestamp: new Date().toISOString()
    }),
  });
}

// Obtener Ventas 
export async function getSales(merchantId) {
  return apiRequest(`/sales?merchantId=${merchantId}`);
}

// Obtener Info del Mercader
export async function getMerchantInfo(merchantId) {
  return apiRequest(`/merchants/${merchantId}`);
}