"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const HeatmapLayer = dynamic(() => import('./HeatmapLayer'), { ssr: false });

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 15); 
    }
  }, [center, map]);
  return null;
}

interface MerchantMapProps {
  merchants: any[];
  onSelectMerchant: (merchant: any) => void;
  selectedMerchant?: any;
}

export default function MerchantMap({ merchants, onSelectMerchant, selectedMerchant }: MerchantMapProps) {
  const defaultCenter: [number, number] = [-12.11, -77.03];

  // Preparamos los puntos para el Mapa de Calor usando lat/lng planos
  const heatPoints: [number, number, number][] = merchants
  .filter((m) => m.lat && m.lng)
  .map((m) => [
    m.lat,
    m.lng,
    (m.score || 0) / 100 
  ]);

  return (
    <MapContainer 
      center={defaultCenter} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="📍 Marcadores de Comercios">
          {/* Usamos un fragmento de React en lugar de un div para no romper Leaflet */}
          <>
            {merchants.map((merchant) => (
              merchant.lat && merchant.lng && (
                <Marker 
                  key={merchant.id} 
                  position={[merchant.lat, merchant.lng]} 
                  icon={icon}
                  eventHandlers={{
                    click: () => onSelectMerchant(merchant),
                  }}
                >
                  <Popup>
                    <div className="text-center p-1 font-sans">
                      <p className="font-bold text-gray-900">{merchant.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{merchant.location}</p>
                      <div 
                        className="inline-block px-2 py-0.5 rounded text-white text-[10px] font-bold"
                        style={{ 
                          backgroundColor: merchant.score >= 80 ? '#10b981' : 
                                           merchant.score >= 60 ? '#3b82f6' : 
                                           merchant.score >= 40 ? '#f59e0b' : '#ef4444' 
                        }}
                      >
                        Score: {merchant.score}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="🔥 Mapa de Calor de Riesgo">
          <HeatmapLayer points={heatPoints} />
        </LayersControl.Overlay>
      </LayersControl>

      {selectedMerchant?.lat && selectedMerchant?.lng && (
        <MapController center={[selectedMerchant.lat, selectedMerchant.lng]} />
      )}
    </MapContainer>
  )
}