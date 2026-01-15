// API service for Score de Barrio backend

const API_URL = "https://barrio-ledger-dashboard.vercel.app/api";

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

// Register a new merchant
export async function registerMerchant({ phone, businessName, location }) {
  const response = await fetch('https://barrio-ledger-dashboard.vercel.app/api/merchants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: `0x${phone}`, 
      name: businessName, 
      location: location
    }),
  });
  return response.json();
}

// Register a sale
export async function registerSale({ amount, paymentMethod, merchantId }) {
  return apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify({
      merchantId, // ID del comercio que realiza la venta
      amount: parseFloat(amount),
      paymentMethod, // "Cash", "Digital", "Crypto"
      timestamp: new Date().toISOString()
    }),
  });
}

// Get sales for a merchant
export async function getSales(merchantId, limit = 50, offset = 0) {
  return apiRequest(`/sales/merchant/${merchantId}?limit=${limit}&offset=${offset}`);
}

// Get merchant info
export async function getMerchantInfo(merchantId) {
  return apiRequest(`/merchants/${merchantId}`);
}

// Health check
export async function healthCheck() {
  return apiRequest('/health', {
    baseUrl: API_URL.replace('/api', ''),
  });
}