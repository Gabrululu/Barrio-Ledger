'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, MapPin, TrendingUp } from 'lucide-react';
import { MerchantCard } from '@/components/merchants/MerchantCard';

interface Merchant {
  id: string;
  name: string;
  location: string;
  score: number;
  salesLastMonth: number;
  trend: 'up' | 'down' | 'stable';
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState(0);

  useEffect(() => {
    // Fetch merchants from API
    fetch('/api/merchants')
      .then(res => res.json())
      .then(data => {
        setMerchants(data.merchants || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        setMerchants([
          { id: '0x265...', name: 'Bodega Don Pepe', location: 'Miraflores, Lima', score: 92, salesLastMonth: 12500, trend: 'up' },
          { id: '0x2af...', name: 'Minimarket El Sol', location: 'San Isidro, Lima', score: 87, salesLastMonth: 18200, trend: 'up' },
          { id: '0xec9...', name: 'Bodega La Esquina', location: 'Barranco, Lima', score: 78, salesLastMonth: 9800, trend: 'stable' },
          { id: '0x7f8...', name: 'Tienda Mi Barrio', location: 'San Miguel, Lima', score: 65, salesLastMonth: 7200, trend: 'down' },
          { id: '0xabc...', name: 'Bodega Central', location: 'Miraflores, Lima', score: 85, salesLastMonth: 15300, trend: 'up' },
        ]);
        setLoading(false);
      });
  }, []);

  // Filter merchants
  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = m.score >= filterScore;
    return matchesSearch && matchesScore;
  });

  const handleExport = () => {
    // Export to CSV
    const csv = [
      ['ID', 'Nombre', 'Ubicación', 'Score', 'Ventas Último Mes', 'Tendencia'],
      ...filteredMerchants.map(m => [
        m.id,
        m.name,
        m.location,
        m.score,
        m.salesLastMonth,
        m.trend
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comercios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comercios</h1>
          <p className="text-gray-600 mt-1">
            {filteredMerchants.length} comercio{filteredMerchants.length !== 1 ? 's' : ''} encontrado{filteredMerchants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o ubicación..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Score Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={0}>Todos los scores</option>
              <option value={80}>Score ≥ 80 (Excelente)</option>
              <option value={60}>Score ≥ 60 (Bueno)</option>
              <option value={40}>Score ≥ 40 (Regular)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Merchants Grid */}
      {filteredMerchants.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron comercios
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
}