'use client';

import { useEffect, useState } from 'react';
import { Store, DollarSign, TrendingUp, Users, ArrowUp, ArrowDown, LayoutDashboard } from 'lucide-react';
import { SalesChart } from '@/components/charts/SalesChart';
import { DistributionChart } from '@/components/charts/DistributionChart';
import { Analytics } from '@/components/merchants/Analytics';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {}); 
    };

    fetch('/api/stats/overview')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
        playSound(); 
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const KPICard = ({ icon: Icon, title, value, trend, color }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-slate-500 font-medium animate-pulse">Sincronizando con Mantle Network...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Protocol Overview</h1>
          <p className="text-slate-500 font-medium">Inclusión financiera verificada on-chain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Store} title="Comercios" value={stats?.totalMerchants.toLocaleString()} trend={stats?.merchantsGrowth} color="#10b981" />
        <KPICard icon={DollarSign} title="Volumen Total" value={`S/ ${stats?.totalSales.toLocaleString()}`} trend={stats?.salesGrowth} color="#3b82f6" />
        <KPICard icon={TrendingUp} title="Consenso Score" value={stats?.avgScore} trend={stats?.scoreGrowth} color="#f59e0b" />
        <KPICard icon={Users} title="Nuevos On-Chain" value={stats?.newMerchants} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
           <Analytics merchants={[]} sales={[]} />
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Tendencia de Transacciones</h2>
              <SalesChart />
           </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
           <h2 className="text-xl font-bold text-slate-800 mb-6">Distribución de Riesgo</h2>
           <DistributionChart />
        </div>
      </div>
    </div>
  );
}