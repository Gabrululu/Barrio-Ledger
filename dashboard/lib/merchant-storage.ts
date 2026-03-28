const STORAGE_KEY = 'score_merchant_data';

export interface MerchantData {
  id: string;
  merchantId: string;
  businessName: string;
  location: string;
  score: number;
  stats: Record<string, unknown>;
}

function encode(data: MerchantData): string {
  return btoa(JSON.stringify(data));
}

function decode(encoded: string): MerchantData | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function saveMerchantData(merchantData: MerchantData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, encode(merchantData));
    return true;
  } catch {
    return false;
  }
}

export function getMerchantData(): MerchantData | null {
  try {
    const encoded = localStorage.getItem(STORAGE_KEY);
    if (!encoded) return null;
    return decode(encoded);
  } catch {
    return null;
  }
}

export function clearMerchantData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
