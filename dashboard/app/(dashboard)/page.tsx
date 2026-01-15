'use client';

import { useEffect, useState } from 'react';
import { Store, DollarSign, TrendingUp, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { SalesChart } from '@/components/charts/SalesChart';
import { DistributionChart } from '@/components/charts/DistributionChart';

interface Stats {
  totalMerchants: number;
  totalSales: number;
  avgScore: number;
  newMerchants: number;
  salesGrowth: number;
  scoreGrowth: number;
  merchantsGrowth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/stats/overview')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        setStats({
          totalMerchants: 1234,
          totalSales: 1270000,
          avgScore: 78,
          newMerchants: 45,
          salesGrowth: 12.5,
          scoreGrowth: 3.2,
          merchantsGrowth: 8.7,
        });
        setLoading(false);
      });
  }, []);

  const KPICard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend, 
    color 
  }: { 
    icon: any; 
    title: string; 
    value: string; 
    trend?: number; 
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-1">
          Vista general de todos los comercios registrados
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Store}
          title="Comercios Activos"
          value={stats?.totalMerchants.toLocaleString() || '0'}
          trend={stats?.merchantsGrowth}
          color="#10b981"
        />
        <KPICard
          icon={DollarSign}
          title="Ventas Totales"
          value={`S/ ${(stats?.totalSales || 0).toLocaleString()}`}
          trend={stats?.salesGrowth}
          color="#3b82f6"
        />
        <KPICard
          icon={TrendingUp}
          title="Score Promedio"
          value={String(stats?.avgScore || 0)}
          trend={stats?.scoreGrowth}
          color="#f59e0b"
        />
        <KPICard
          icon={Users}
          title="Nuevos esta semana"
          value={String(stats?.newMerchants || 0)}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ventas Últimos 7 Días
          </h2>
          <SalesChart />
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Scores
          </h2>
          <DistributionChart />
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 Comercios por Score
        </h2>
        <div className="space-y-3">
          {[
            { name: 'Bodega Don Pepe', score: 92, location: 'Miraflores' },
            { name: 'Minimarket El Sol', score: 87, location: 'San Isidro' },
            { name: 'Bodega Central', score: 85, location: 'Miraflores' },
            { name: 'Tienda Mi Barrio', score: 82, location: 'San Miguel' },
            { name: 'Bodega La Esquina', score: 78, location: 'Barranco' },
          ].map((merchant, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{merchant.name}</p>
                  <p className="text-sm text-gray-500">{merchant.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{merchant.score}</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}