"use client"

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

// Configuración de los iconos de Leaflet para evitar errores de carga en Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Sub-componente para mover la cámara del mapa programáticamente
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15); // Hace zoom al comercio seleccionado
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
  // Coordenadas por defecto (Centro de Lima/Miraflores)
  const defaultCenter: [number, number] = [-12.11, -77.03];

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
      
      {/* Controlador para centrar el mapa al seleccionar */}
      {selectedMerchant?.coordinates && (
        <MapController center={[selectedMerchant.coordinates.lat, selectedMerchant.coordinates.lng]} />
      )}

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
              <div className="text-center p-1">
                <p className="font-bold text-gray-900">{merchant.name}</p>
                <p className="text-xs text-gray-500 mb-1">{merchant.location}</p>
                <div 
                  className="inline-block px-2 py-0.5 rounded text-white text-[10px] font-bold"
                  style={{ backgroundColor: merchant.score >= 80 ? '#10b981' : '#3b82f6' }}
                >
                  Score: {merchant.score}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}