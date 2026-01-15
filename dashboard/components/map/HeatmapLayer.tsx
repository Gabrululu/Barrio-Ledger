"use client"

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export default function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // Configuración de gradiente: 
    // 0.4 (Bajo Score) -> Rojo
    // 0.6 (Medio) -> Naranja/Amarillo
    // 1.0 (Alto Score) -> Verde Esmeralda
    // @ts-ignore
    const heatLayer = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      gradient: {
        0.2: '#ef4444', // Rojo (Riesgo)
        0.5: '#f59e0b', // Ámbar (Medio)
        0.8: '#10b981', // Verde (Excelente)
        1.0: '#059669'  // Esmeralda oscuro
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}