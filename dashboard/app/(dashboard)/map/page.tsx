'use client';

import { useState, useEffect } from 'react';
import { MapPin, Filter, Search } from 'lucide-react';

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
    // Fetch merchants with coordinates
    fetch('/api/merchants?includeCoordinates=true')
      .then(res => res.json())
      .then(data => {
        setMerchants(data.merchants || []);
        setLoading(false);
      })
      .catch(() => {
        // Mock data with Lima coordinates
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

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Bajo';
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={0}>Todos los scores</option>
            <option value={80}>Score ≥ 80</option>
            <option value={60}>Score ≥ 60</option>
            <option value={40}>Score ≥ 40</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-[600px] bg-gray-100">
              {/* Map placeholder - En producción usarías Leaflet o Mapbox */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Mapa Interactivo
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Integra Leaflet o Mapbox para visualización
                  </p>
                  <div className="inline-block p-4 bg-blue-50 rounded-lg">
                    <code className="text-xs text-blue-700">
                      npm install react-leaflet leaflet
                    </code>
                  </div>
                </div>
              </div>

              {/* Simulated markers */}
              <div className="absolute inset-0 p-8">
                {filteredMerchants.slice(0, 5).map((merchant, index) => (
                  <button
                    key={merchant.id}
                    onClick={() => setSelectedMerchant(merchant)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + (index % 3) * 15}%`,
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: getScoreColor(merchant.score) }}
                    >
                      <span className="text-xs font-bold text-white">{merchant.score}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Merchant List */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Leyenda</h3>
            <div className="space-y-2">
              {[
                { label: 'Excelente (80-100)', color: '#10b981' },
                { label: 'Bueno (60-79)', color: '#3b82f6' },
                { label: 'Regular (40-59)', color: '#f59e0b' },
                { label: 'Bajo (0-39)', color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Merchant */}
          {selectedMerchant && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Seleccionado</h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{selectedMerchant.name}</p>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedMerchant.location}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-600">Score</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: getScoreColor(selectedMerchant.score) }}
                  >
                    {selectedMerchant.score}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Merchants List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-h-[400px] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">
                Comercios ({filteredMerchants.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredMerchants.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => setSelectedMerchant(merchant)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedMerchant?.id === merchant.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {merchant.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {merchant.location}
                      </p>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
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

      {/* Stats by District */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Estadísticas por Distrito
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { district: 'Miraflores', count: 45, avgScore: 82 },
            { district: 'San Isidro', count: 38, avgScore: 85 },
            { district: 'Barranco', count: 23, avgScore: 74 },
            { district: 'San Miguel', count: 31, avgScore: 71 },
            { district: 'Surco', count: 42, avgScore: 79 },
          ].map((district) => (
            <div key={district.district} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {district.district}
              </p>
              <p className="text-2xl font-bold text-gray-900">{district.count}</p>
              <p className="text-xs text-gray-500 mt-1">
                Score promedio: {district.avgScore}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}