import { useState, useEffect } from 'react';
import { Store, LogOut, TrendingUp, DollarSign, Zap, Activity, Download, ChevronRight } from 'lucide-react';
import SaleForm from './SaleForm';
import SalesList from './SalesList';
import { getSales } from '../services/api';

function Dashboard({ merchant, onLogout }) {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const merchantId = merchant.id || merchant.merchantId;
  const businessName = merchant.name || merchant.businessName || "Mi Negocio";

  useEffect(() => {
    if (merchantId) {
      loadSales();
    }
  }, [merchantId]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales(merchantId);
      const salesData = data.sales || (Array.isArray(data) ? data : []);
      setSales(salesData);
      calculateTotals(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (salesList) => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    let todaySum = 0;
    let monthSum = 0;

    salesList.forEach(sale => {
      const saleDate = new Date(sale.timestamp || (sale.created_at * 1000));
      const amount = parseFloat(sale.amount || 0);

      if (saleDate.toDateString() === today) todaySum += amount;
      if (saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear) monthSum += amount;
    });

    setTodayTotal(todaySum);
    setMonthTotal(monthSum);
  };

  const handleSaleRegistered = (newSale) => {
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    calculateTotals(updatedSales);
  };

  const exportToCSV = () => {
    if (sales.length === 0) return alert("No hay ventas para exportar");
    
    const headers = ["Fecha", "Monto", "Metodo"].join(",");
    const rows = sales.map(s => {
      const date = new Date(s.timestamp || s.created_at * 1000).toLocaleDateString();
      return `${date},${s.amount},${s.paymentMethod || 'Digital'}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${businessName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{businessName}</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Mantle Trust Verified</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Mensaje de Bienvenida */}
        <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1">¡Hola, {businessName.split(' ')[0]}! 👋</h2>
            <p className="text-emerald-100 text-sm opacity-90">Tu negocio ha crecido un 12% esta semana.</p>
            <button 
              onClick={exportToCSV}
              className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center transition-all"
            >
              <Download className="w-3 h-3 mr-2" />
              Descargar Reporte CSV
            </button>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-amber-100 rounded-lg"><DollarSign className="w-4 h-4 text-amber-600" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Hoy</span>
            </div>
            <p className="text-2xl font-black text-slate-800">S/ {todayTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg"><Activity className="w-4 h-4 text-blue-600" /></div>
              <span className="text-xs font-bold text-slate-400 uppercase">Mes</span>
            </div>
            <p className="text-2xl font-black text-slate-800">S/ {monthTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Registro de Venta */}
        <SaleForm merchantId={merchantId} onSaleRegistered={handleSaleRegistered} />

        {/* Lista de Actividad */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-800">Actividad Reciente</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sales.length} Movimientos</span>
          </div>
          <SalesList sales={sales} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;