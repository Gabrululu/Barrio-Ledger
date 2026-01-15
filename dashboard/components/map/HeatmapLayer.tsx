"use client"

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

// Importación segura para evitar errores de SSR
if (typeof window !== 'undefined') {
  require('leaflet.heat')
}

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensidad]
}

export default function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // @ts-ignore - Leaflet.heat no tiene tipos oficiales de TS
    const heatLayer = L.heatLayer(points, {
      radius: 35, // Aumentado para mejor visibilidad
      blur: 15,
      max: 1.0,
      gradient: {
        0.2: '#ef4444', // Rojo: Zonas con comercios de bajo score o pocos registros
        0.4: '#f59e0b', // Ámbar: Actividad moderada
        0.7: '#10b981', // Verde: Zonas con alta reputación (Mantle Trust)
        1.0: '#059669'  // Esmeralda: Hubs financieros consolidados
      }
    }).addTo(map);

    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
}