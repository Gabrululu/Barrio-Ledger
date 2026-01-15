"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function ScoreGauge({ score }: { score: number }) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Verde (Excelente)
    if (val >= 60) return '#3b82f6'; // Azul (Bueno)
    if (val >= 40) return '#f59e0b'; // Naranja (Regular)
    return '#ef4444'; // Rojo (Bajo)
  };

  return (
    <div className="h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={65}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getScoreColor(score)} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Puntaje</span>
      </div>
    </div>
  );
}