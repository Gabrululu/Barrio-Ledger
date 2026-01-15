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

// Registro de Comercio
export async function registerMerchant({ phone, businessName, location }) {
  // Usamos el ID formateado como 0x... para simular una wallet de Mantle
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

// Registro de Venta - Sincronizado con SaleForm y Dashboard
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

export async function getSales(merchantId) {
  return apiRequest(`/sales?merchantId=${merchantId}`);
}

export async function getMerchantInfo(merchantId) {
  return apiRequest(`/merchants/${merchantId}`);
}