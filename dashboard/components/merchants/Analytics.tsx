'use client';

import { BarChart, Activity, Map as MapIcon, Flame } from 'lucide-react';

export function Analytics({ merchants, sales }: any) {
  const hotspots = [
    { name: 'Lima Centro', activity: 85, color: 'bg-orange-500' },
    { name: 'Miraflores', activity: 65, color: 'bg-orange-400' },
    { name: 'San Miguel', activity: 45, color: 'bg-orange-300' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sección de Métricas */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2" /> Eficiencia del Protocolo
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xs text-slate-500">Tasa de Sincronización</span>
            <span className="text-sm font-bold text-emerald-600">99.9%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full">
            <div className="bg-emerald-500 h-full rounded-full w-[99%]"></div>
          </div>
        </div>
      </div>

      {/* Mini Mapa de Calor */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center">
          <Flame className="w-4 h-4 mr-2 text-orange-500" /> Hotspots Financieros
        </h3>
        <div className="space-y-3">
          {hotspots.map((spot, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] mb-1">
                  <span>{spot.name}</span>
                  <span>{spot.activity}%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full">
                  <div className={`${spot.color} h-full rounded-full`} style={{ width: `${spot.activity}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}