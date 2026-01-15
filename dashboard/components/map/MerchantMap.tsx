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
    if (center) {
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
  // Coordenadas por defecto
  const defaultCenter: [number, number] = [-12.11, -77.03];

  // Preparamos los puntos para el Mapa de Calor
  // Formato: [lat, lng, intensidad] donde intensidad depende del score
  const heatPoints: [number, number, number][] = merchants
    .filter((m) => m.coordinates)
    .map((m) => [
      m.coordinates.lat,
      m.coordinates.lng,
      m.score / 100 // Escala de 0 a 1 para la intensidad del calor
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <LayersControl position="topright">
        {/* Capa 1: Marcadores Individuales */}
        <LayersControl.Overlay checked name="📍 Marcadores de Comercios">
          <div key="markers-group">
            {merchants.map((merchant) => (
              merchant.coordinates && (
                <Marker 
                  key={merchant.id} 
                  position={[merchant.coordinates.lat, merchant.coordinates.lng]} 
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
          </div>
        </LayersControl.Overlay>

        {/* Capa 2: Mapa de Calor (Heatmap) */}
        <LayersControl.Overlay name="🔥 Mapa de Calor de Riesgo">
          <HeatmapLayer points={heatPoints} />
        </LayersControl.Overlay>
      </LayersControl>

      {/* Controlador para centrar el mapa al seleccionar un comercio en la lista */}
      {selectedMerchant?.coordinates && (
        <MapController center={[selectedMerchant.coordinates.lat, selectedMerchant.coordinates.lng]} />
      )}
    </MapContainer>
  )
}