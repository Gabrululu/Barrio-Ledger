'use client';

import { useState, useEffect } from 'react';
import { MapPin, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';

const MerchantMap = dynamic(() => import('@/components/map/MerchantMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <div className="text-gray-400 flex flex-col items-center">
        <MapPin className="w-12 h-12 mb-2 animate-bounce" />
        <span>Cargando mapa interactivo...</span>
      </div>
    </div>
  )
});

interface Merchant {
  id: string;
  name: string;
  location: string;
  score: number;
  coordinates?: { lat: number; lng: number };
}

export default function MapPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [filterScore, setFilterScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/merchants?includeCoordinates=true')
      .then(res => res.json())
      .then(data => {
        setMerchants(data.merchants || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback con coordenadas reales de Lima para la demo
        setMerchants([
          { id: '1', name: 'Bodega Don Pepe', location: 'Miraflores', score: 92, coordinates: { lat: -12.1191, lng: -77.0349 } },
          { id: '2', name: 'Minimarket El Sol', location: 'San Isidro', score: 87, coordinates: { lat: -12.0931, lng: -77.0465 } },
          { id: '3', name: 'Bodega La Esquina', location: 'Barranco', score: 78, coordinates: { lat: -12.1464, lng: -77.0206 } },
          { id: '4', name: 'Tienda Mi Barrio', location: 'San Miguel', score: 65, coordinates: { lat: -12.0773, lng: -77.0881 } },
          { id: '5', name: 'Bodega Central', location: 'Miraflores', score: 85, coordinates: { lat: -12.1230, lng: -77.0300 } },
        ]);
        setLoading(false);
      });
  }, []);

  const filteredMerchants = merchants.filter(m => m.score >= filterScore);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mapa de Comercios</h1>
        <p className="text-gray-600 mt-1">
          Vista geográfica de {filteredMerchants.length} comercios en Lima
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value={0}>Todos los scores</option>
            <option value={80}>Score ≥ 80 (Excelente)</option>
            <option value={60}>Score ≥ 60 (Bueno)</option>
            <option value={40}>Score ≥ 40 (Regular)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Interactive Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px]">
            {/* Cargamos el componente de Leaflet y le pasamos los datos filtrados */}
            <MerchantMap 
                merchants={filteredMerchants} 
                onSelectMerchant={setSelectedMerchant} 
            />
          </div>
        </div>

        {/* Sidebar - Merchant List */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Leyenda de Riesgo</h3>
            <div className="space-y-2">
              {[
                { label: 'Excelente (80-100)', color: '#10b981' },
                { label: 'Bueno (60-79)', color: '#3b82f6' },
                { label: 'Regular (40-59)', color: '#f59e0b' },
                { label: 'Bajo (0-39)', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Merchant Details */}
          {selectedMerchant && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h3 className="font-semibold text-gray-900 mb-2">Comercio Seleccionado</h3>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{selectedMerchant.name}</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {selectedMerchant.location}
                </p>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-medium text-gray-700">Puntaje:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getScoreColor(selectedMerchant.score) }}
                  >
                    {selectedMerchant.score} pts
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* List of filtered merchants */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-h-[300px] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900 text-sm">Lista de Comercios</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredMerchants.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => setSelectedMerchant(merchant)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedMerchant?.id === merchant.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-xs">{merchant.name}</p>
                      <p className="text-[10px] text-gray-500">{merchant.location}</p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: getScoreColor(merchant.score) }}
                    >
                      {merchant.score}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* District Stats Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas Geográficas</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { district: 'Miraflores', count: 45, avgScore: 82 },
            { district: 'San Isidro', count: 38, avgScore: 85 },
            { district: 'Barranco', count: 23, avgScore: 74 },
            { district: 'San Miguel', count: 31, avgScore: 71 },
            { district: 'Surco', count: 42, avgScore: 79 },
          ].map((dist) => (
            <div key={dist.district} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{dist.district}</p>
              <p className="text-xl font-black text-gray-900 my-1">{dist.count}</p>
              <div className="text-[10px] text-gray-400 font-medium">Avg: {dist.avgScore} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}