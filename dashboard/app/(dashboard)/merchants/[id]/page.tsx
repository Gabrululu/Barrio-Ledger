'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import ScoreGauge from '@/components/charts/ScoreGauge';
import {SalesChart} from '@/components/charts/SalesChart';

interface MerchantDetail {
  id: string;
  name: string;
  location: string;
  registeredAt: string;
  score: number;
  scoreBreakdown: {
    stability: number;
    volume: number;
    trend: number;
    diversity: number;
  };
  stats: {
    salesLastMonth: number;
    avgTicket: number;
    transactions: number;
    cashPercentage: number;
    digitalPercentage: number;
  };
}

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch merchant detail from API
    fetch(`/api/merchants/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setMerchant(data.merchant);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        setMerchant({
          id: params.id as string,
          name: 'Bodega Don Pepe',
          location: 'Miraflores, Lima',
          registeredAt: '2024-01-13',
          score: 92,
          scoreBreakdown: {
            stability: 95,
            volume: 90,
            trend: 88,
            diversity: 85,
          },
          stats: {
            salesLastMonth: 12500,
            avgTicket: 25.50,
            transactions: 490,
            cashPercentage: 65,
            digitalPercentage: 35,
          },
        });
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Comercio no encontrado</h2>
      </div>
    );
  }

  const creditLimit = Math.floor(merchant.stats.salesLastMonth * 0.5);
  const scoreCategory = merchant.score >= 80 ? 'Excelente' : 
                       merchant.score >= 60 ? 'Bueno' : 
                       merchant.score >= 40 ? 'Regular' : 'Bajo';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver a lista</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {merchant.name}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {merchant.location}
              </div>
              <div>
                Registrado: {new Date(merchant.registeredAt).toLocaleDateString('es-PE')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ventas Último Mes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    S/ {merchant.stats.salesLastMonth.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    S/ {merchant.stats.avgTicket.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transacciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {merchant.stats.transactions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-sm text-white">
              <p className="text-sm opacity-90 mb-1">Crédito Sugerido</p>
              <p className="text-2xl font-bold">
                S/ {creditLimit.toLocaleString()}
              </p>
              <p className="text-xs opacity-75 mt-1">
                50% de ventas mensuales
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Desglose del Score
            </h2>
            <div className="space-y-4">
              {Object.entries(merchant.scoreBreakdown).map(([key, value]) => {
                const labels: Record<string, string> = {
                  stability: 'Estabilidad',
                  volume: 'Volumen',
                  trend: 'Tendencia',
                  diversity: 'Diversidad'
                };
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {labels[key]}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {value}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Histórico de Ventas
            </h2>
            <SalesChart />
          </div>
        </div>

        {/* Right Column - Score Gauge */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Score General
            </h2>
            <ScoreGauge score={merchant.score} />
            <div className="text-center mt-6">
              <div className="inline-flex px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                {scoreCategory}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Métodos de Pago
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Efectivo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {merchant.stats.cashPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${merchant.stats.cashPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Digital</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {merchant.stats.digitalPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${merchant.stats.digitalPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}