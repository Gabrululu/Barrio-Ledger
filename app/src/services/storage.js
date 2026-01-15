// Local storage service for merchant data

const STORAGE_KEY = 'score_merchant_data';

// Simple encryption/decryption (base64 for now, can be upgraded to Web Crypto API)
function encode(data) {
  return btoa(JSON.stringify(data));
}

function decode(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch (error) {
    console.error('Failed to decode data:', error);
    return null;
  }
}

// Save merchant data
export async function saveMerchantData(merchantData) {
  try {
    const encoded = encode(merchantData);
    localStorage.setItem(STORAGE_KEY, encoded);
    return true;
  } catch (error) {
    console.error('Failed to save merchant data:', error);
    return false;
  }
}

// Get merchant data
export async function getMerchantData() {
  try {
    const encoded = localStorage.getItem(STORAGE_KEY);
    if (!encoded) return null;
    
    return decode(encoded);
  } catch (error) {
    console.error('Failed to get merchant data:', error);
    return null;
  }
}

// Clear merchant data (logout)
export async function clearMerchantData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear merchant data:', error);
    return false;
  }
}