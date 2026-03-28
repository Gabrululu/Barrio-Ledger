'use client';

import { useState, useEffect } from 'react';
import RegisterForm from '@/components/comerciante/RegisterForm';
import MerchantDashboard from '@/components/comerciante/MerchantDashboard';
import { getMerchantData, saveMerchantData, clearMerchantData, MerchantData } from '@/lib/merchant-storage';

export default function ComerciantePage() {
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getMerchantData();
    if (saved) setMerchant(saved);
    setLoading(false);
  }, []);

  const handleRegister = (merchantData: MerchantData) => {
    saveMerchantData(merchantData);
    setMerchant(merchantData);
  };

  const handleLogout = () => {
    clearMerchantData();
    setMerchant(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!merchant) {
    return <RegisterForm onRegister={handleRegister} />;
  }

  return <MerchantDashboard merchant={merchant} onLogout={handleLogout} />;
}
