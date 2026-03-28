import { ethers } from 'ethers';
import { verifyMerchantOnChain } from './blockchain';

// Las rutas /api/* de Next.js están en el mismo origen — sin CORS, sin Railway.
const API_URL = '/api';

function formatBytes32Id(id: string) {
  return ethers.zeroPadValue(id, 32);
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  let data: Record<string, unknown> = {};
  if (contentType?.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error((data.error as string) || 'La operación falló');
  }

  return data;
}

export async function getOnChainScore(merchantId: string) {
  try {
    const onChainData = await verifyMerchantOnChain(formatBytes32Id(merchantId));
    if (onChainData.isVerified) {
      return {
        score: 82,
        totalOnChain: onChainData.totalOnChain,
        txCount: onChainData.txCount,
        verified: true,
      };
    }
    return { score: 75, verified: false };
  } catch (error) {
    console.error('Error al obtener datos on-chain:', error);
    return { score: 75, verified: false };
  }
}

export async function registerMerchant({ phone, businessName, location }: {
  phone: string;
  businessName: string;
  location: string;
}) {
  const merchantId = `0x${phone}`;
  return apiRequest('/merchants', {
    method: 'POST',
    body: JSON.stringify({ id: merchantId, name: businessName, location }),
  });
}

export async function registerSale({ amount, paymentMethod, merchantId }: {
  amount: number;
  paymentMethod: string;
  merchantId: string;
}) {
  return apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify({
      merchantId,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString(),
    }),
  });
}

export async function getSales(merchantId: string) {
  return apiRequest(`/sales?merchantId=${merchantId}`);
}

export async function getMerchantInfo(merchantId: string) {
  return apiRequest(`/merchants/${merchantId}`);
}
