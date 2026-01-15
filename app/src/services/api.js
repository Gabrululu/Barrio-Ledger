// API service for Score de Barrio backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper: Make API request with error handling
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Register a new merchant
export async function registerMerchant({ phone, businessName, location }) {
  return apiRequest('/merchants', {
    method: 'POST',
    body: JSON.stringify({
      phone,
      businessName,
      location,
    }),
  });
}

// Register a sale
export async function registerSale({ amount, paymentMethod, apiKey }) {
  return apiRequest('/sales', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      amount,
      paymentMethod,
      timestamp: Math.floor(Date.now() / 1000),
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
    baseUrl: API_BASE_URL.replace('/api', ''),
  });
}