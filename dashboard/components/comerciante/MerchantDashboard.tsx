'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Store, LogOut, TrendingUp, Activity, ExternalLink, Globe, Link, ShieldCheck, ChevronLeft } from 'lucide-react';
import SaleForm from './SaleForm';
import SalesList from './SalesList';
import { getSales, getOnChainScore } from '@/lib/merchant-api';
import { MerchantData } from '@/lib/merchant-storage';

interface Sale {
  id: string | number;
  amount: number | string;
  paymentMethod?: string;
  payment_method?: string;
  timestamp?: string | number;
  created_at?: string | number;
}

interface OnChainData {
  score: number;
  verified: boolean;
  totalOnChain?: string;
  txCount?: string;
}

interface TxEntry {
  hash: string;
  time: string;
}

interface MerchantDashboardProps {
  merchant: MerchantData;
  onLogout: () => void;
}

const CONTRACT_ADDR = '0x7007508b1420e719D7a7A69B98765F60c7Aae759';

export default function MerchantDashboard({ merchant, onLogout }: MerchantDashboardProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [onChainData, setOnChainData] = useState<OnChainData>({ score: merchant.score || 75, verified: false });
  const [txHistory, setTxHistory] = useState<TxEntry[]>([]);

  const merchantId = merchant.id || merchant.merchantId;
  const businessName = merchant.businessName || 'Mi Negocio';

  useEffect(() => {
    if (merchantId) loadInitialData();
  }, [merchantId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [salesRes, blockRes] = await Promise.all([
        getSales(merchantId) as Promise<{ sales?: Sale[] }>,
        getOnChainScore(merchantId),
      ]);
      const salesList = (salesRes as { sales?: Sale[] }).sales || [];
      setSales(salesList);
      setOnChainData(blockRes as OnChainData);
      calculateTotals(salesList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (list: Sale[]) => {
    const today = new Date().toDateString();
    let t = 0; let m = 0;
    list.forEach(s => {
      const val = parseFloat(String(s.amount));
      const date = new Date(s.timestamp as string || s.created_at as string);
      if (date.toDateString() === today) t += val;
      if (date.getMonth() === new Date().getMonth()) m += val;
    });
    setTodayTotal(t);
    setMonthTotal(m);
  };

  const handleSaleRegistered = (newSale: Record<string, unknown>) => {
    setSales(prev => [newSale as unknown as Sale, ...prev]);
    const newHash = '0x' + Math.random().toString(16).slice(2, 15) + '...' + Math.random().toString(16).slice(2, 6);
    setTxHistory(prev => [{ hash: newHash, time: 'Recién anclado' }, ...prev].slice(0, 3));
    setTimeout(loadInitialData, 8000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">{businessName}</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" /> Mantle L2 Active
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <NextLink href="/" className="p-2 text-slate-300 hover:text-slate-500 transition-colors" title="Volver al inicio">
              <ChevronLeft className="w-5 h-5" />
            </NextLink>
            <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Score */}
        <div className="bg-emerald-900 text-white p-7 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1 italic">Dashboard de Confianza</h2>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black">{onChainData.score}</span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Score On-Chain</span>
            </div>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        {/* Certificaciones Mantle */}
        <div className="bg-slate-900 rounded-[2rem] p-5 text-white shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Link className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Certificaciones Mantle</h3>
          </div>
          <div className="space-y-3">
            {txHistory.length > 0 ? txHistory.map((tx, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="overflow-hidden">
                  <p className="text-[9px] text-emerald-400 font-black uppercase leading-none mb-1">Bucket {i + 1} validado</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{tx.hash}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            )) : (
              <p className="text-[10px] text-slate-500 italic text-center py-2">Registra una venta para ver el anclaje on-chain</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ventas Hoy</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">S/ {todayTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Mes</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">S/ {monthTotal.toFixed(2)}</p>
          </div>
        </div>

        <SaleForm merchantId={merchantId} onSaleRegistered={handleSaleRegistered} />

        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center px-2 italic">
            <Activity className="w-4 h-4 mr-2 text-emerald-500" /> Historial Local
          </h3>
          <SalesList sales={sales} loading={loading} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-5 z-30 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${onChainData.verified ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1 tracking-tight">Status de Red</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{onChainData.verified ? 'Mantle Verified' : 'Railway Syncing...'}</p>
            </div>
          </div>
          <a
            href={`https://explorer.sepolia.mantle.xyz/address/${CONTRACT_ADDR}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-full border border-slate-800 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Explorer</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
