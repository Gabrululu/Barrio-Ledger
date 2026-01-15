'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Map, CreditCard, PieChart as PieChartIcon } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data existente
  const growthData = [
    { date: 'Sem 1', merchants: 850, sales: 450000 },
    { date: 'Sem 2', merchants: 920, sales: 510000 },
    { date: 'Sem 3', merchants: 1050, sales: 580000 },
    { date: 'Sem 4', merchants: 1234, sales: 670000 },
  ];

  const hourlyData = [
    { hour: '6am', sales: 120 },
    { hour: '9am', sales: 450 },
    { hour: '12pm', sales: 780 },
    { hour: '3pm', sales: 620 },
    { hour: '6pm', sales: 890 },
    { hour: '9pm', sales: 340 },
  ];

  const categoryData = [
    { category: 'Bodegas', value: 620, color: '#10b981' },
    { category: 'Minimarkets', value: 380, color: '#3b82f6' },
    { category: 'Tiendas', value: 234, color: '#f59e0b' },
  ];

  const topMerchants = [
    { rank: 1, name: 'Bodega Don Pepe', sales: 25800, growth: 18.5 },
    { rank: 2, name: 'Minimarket El Sol', sales: 23400, growth: 15.2 },
    { rank: 3, name: 'Bodega Central', sales: 21500, growth: 12.8 },
    { rank: 4, name: 'Tienda Mi Barrio', sales: 19200, growth: 10.3 },
    { rank: 5, name: 'Bodega La Esquina', sales: 17800, growth: 8.7 },
  ];

  // Nuevos datos para comparación por distrito
  const districtData = [
    { name: 'Miraflores', avgScore: 85, volume: 45000 },
    { name: 'San Isidro', avgScore: 88, volume: 52000 },
    { name: 'Barranco', avgScore: 78, volume: 31000 },
    { name: 'San Miguel', avgScore: 72, volume: 28000 },
    { name: 'Surco', avgScore: 80, volume: 39000 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    change: number; 
    icon: any; 
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );

  const InsightCard = ({ title, value, description, icon: Icon }: any) => (
    <Card className="bg-slate-50 border-none">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-500">{title}</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Avanzado</h1>
          <p className="text-gray-600 mt-1">
            Análisis macro de la cartera de comercios y comparación por distrito
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Crecimiento Semanal"
          value="+12.5%"
          change={12.5}
          icon={TrendingUp}
          color="#10b981"
        />
        <StatCard
          title="Ventas Promedio"
          value="S/ 1,028"
          change={8.3}
          icon={DollarSign}
          color="#3b82f6"
        />
        <StatCard
          title="Nuevos Comercios"
          value="184"
          change={-2.1}
          icon={Users}
          color="#f59e0b"
        />
        <StatCard
          title="Retención"
          value="94.2%"
          change={5.7}
          icon={TrendingUp}
          color="#8b5cf6"
        />
      </div>

      {/* Comparación por Distrito */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Score Promedio por Distrito */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <CardTitle>Score Promedio por Distrito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="avgScore" fill="#10b981" radius={[4, 4, 0, 0]} name="Score Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Volumen de Ventas por Distrito */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Map className="w-5 h-5 text-blue-600" />
            <CardTitle>Volumen de Ventas (S/)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={districtData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="volume"
                  >
                    {districtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Crecimiento Mensual
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="merchants" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Comercios"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="sales" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Ventas (S/)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad por Hora
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Tipo
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.category} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-gray-600">
                  {cat.category}: {cat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 Comercios por Ventas
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Comercio
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Ventas
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Crecimiento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topMerchants.map((merchant) => (
                <tr key={merchant.rank} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                      {merchant.rank}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{merchant.name}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-semibold text-gray-900">
                      S/ {merchant.sales.toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center space-x-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">+{merchant.growth}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard 
          title="Distrito con Mayor Score" 
          value="San Isidro" 
          description="Promedio de 88 puntos"
          icon={TrendingUp}
        />
        <InsightCard 
          title="Crecimiento Digital" 
          value="+15.4%" 
          description="Uso de pagos QR en bodegas"
          icon={CreditCard}
        />
        <InsightCard 
          title="Zona de Oportunidad" 
          value="San Miguel" 
          description="Baja morosidad detectada"
          icon={PieChartIcon}
        />
      </div>

      {/* Insights Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Mejor Hora
          </h3>
          <p className="text-2xl font-bold text-green-700 mb-1">6pm - 9pm</p>
          <p className="text-sm text-gray-600">
            890 ventas promedio en este horario
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Distrito Líder
          </h3>
          <p className="text-2xl font-bold text-blue-700 mb-1">San Isidro</p>
          <p className="text-sm text-gray-600">
            Score promedio de 88/100
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            Ticket Promedio
          </h3>
          <p className="text-2xl font-bold text-purple-700 mb-1">S/ 25.50</p>
          <p className="text-sm text-gray-600">
            +8.3% vs mes anterior
          </p>
        </div>
      </div>
    </div>
  );
}