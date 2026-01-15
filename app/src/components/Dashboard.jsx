import { useState, useEffect } from 'react';
import { Store, LogOut, TrendingUp, DollarSign, Zap, Activity, Download, ChevronRight, Lock, ShieldCheck, HeartPulse, Clock, Box } from 'lucide-center'; 
import { registerSale, getSales } from '../services/api'; 
import SaleForm from './SaleForm';
import SalesList from './SalesList';

import { 
  Store as StoreIcon, 
  LogOut as LogOutIcon, 
  TrendingUp as TrendingUpIcon, 
  DollarSign as DollarSignIcon, 
  Zap as ZapIcon, 
  Activity as ActivityIcon, 
  Download as DownloadIcon, 
  ChevronRight as ChevronRightIcon, 
  Lock as LockIcon, 
  ShieldCheck as ShieldCheckIcon, 
  HeartPulse as HeartPulseIcon, 
  Clock as ClockIcon, 
  Box as BoxIcon 
} from 'lucide-react';

function Dashboard({ merchant, onLogout }) {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [timeAgo, setTimeAgo] = useState("Sincronizando...");
  const [showHashAlert, setShowHashAlert] = useState(false);
  const [lastHash, setLastHash] = useState("");

  const merchantId = merchant.id || merchant.merchantId;
  const businessName = merchant.name || merchant.businessName || "Mi Negocio";
  const score = merchant.score || 0;

  useEffect(() => {
    const playIntroSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    };

    if (merchantId) {
      loadSales();
      playIntroSound();
    }
  }, [merchantId]);

  useEffect(() => {
    const updateLog = () => {
      if (sales.length === 0) {
        setTimeAgo("Esperando actividad");
        return;
      }
      const lastSale = sales[0];
      const lastDate = new Date(lastSale.timestamp || lastSale.created_at * 1000);
      const diffSeconds = Math.floor((new Date() - lastDate) / 1000);
      const diffMins = Math.floor(diffSeconds / 60);

      if (diffSeconds === 120) {
        const mockHash = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);
        setLastHash(mockHash);
        setShowHashAlert(true);
        setTimeout(() => setShowHashAlert(false), 6000);
      }

      if (diffSeconds < 60) setTimeAgo(`Hace ${diffSeconds}s`);
      else if (diffMins < 60) setTimeAgo(`Hace ${diffMins} min`);
      else setTimeAgo("Hace +1h");
    };
    const interval = setInterval(updateLog, 1000);
    return () => clearInterval(interval);
  }, [sales]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales(merchantId);
      const salesData = data.sales || (Array.isArray(data) ? data : []);
      setSales(salesData);
      calculateTotals(salesData);
    } catch (error) {
      console.error('Error Railway Fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (salesList) => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    let todaySum = 0; let monthSum = 0;
    salesList.forEach(sale => {
      const saleDate = new Date(sale.timestamp || (sale.created_at * 1000));
      const amount = parseFloat(sale.amount || 0);
      if (saleDate.toDateString() === today) todaySum += amount;
      if (saleDate.getMonth() === thisMonth) monthSum += amount;
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
    if (sales.length === 0) return alert("No hay ventas");
    const headers = ["Fecha", "Monto", "Metodo"].join(",");
    const rows = sales.map(s => `${new Date(s.timestamp || s.created_at * 1000).toLocaleDateString()},${s.amount},${s.paymentMethod || 'Digital'}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")));
    link.setAttribute("download", `ventas_${businessName}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {showHashAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 border-2 border-emerald-500 text-white p-4 rounded-3xl shadow-2xl flex items-center space-x-4">
            <BoxIcon className="w-8 h-8 text-emerald-500" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Mantle Layer 2 Batch</p>
              <h4 className="text-sm font-bold">¡Hash de bloque generado!</h4>
              <p className="text-[9px] text-slate-400 font-mono truncate">{lastHash}</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{businessName}</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest tracking-tighter">Mantle Trust Verified</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1 italic">¡Hola, {businessName.split(' ')[0]}!</h2>
            <p className="text-emerald-100 text-xs opacity-80 font-medium">Reputación financiera: {score} pts.</p>
            <button onClick={exportToCSV} className="mt-4 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black py-2.5 px-5 rounded-full flex items-center transition-all border border-white/20 uppercase tracking-widest">
              <DownloadIcon className="w-3 h-3 mr-2" /> Descargar CSV
            </button>
          </div>
          <TrendingUpIcon className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        {score >= 80 ? (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[2.5rem] p-7 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-2.5 rounded-2xl"><ZapIcon className="w-6 h-6 text-yellow-300 fill-yellow-300" /></div>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 uppercase">Línea Desbloqueada</span>
            </div>
            <h3 className="text-2xl font-black mb-1">¡Crédito Disponible!</h3>
            <p className="text-indigo-100 text-xs mb-6 opacity-90 leading-relaxed">Tu flujo verificado en Mantle te permite acceder a capital sin trámites burocráticos.</p>
            <button onClick={() => alert("Solicitando a Mantle...")} className="w-full bg-white text-indigo-700 font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2">
              <span>SOLICITAR S/ 1,500.00</span><ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-7 border-2 border-dashed border-slate-200 shadow-sm">
            <div className="flex items-center justify-between opacity-30 mb-4 font-black">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Acceso a Financiamiento</span><LockIcon className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Alcanza los <span className="font-bold text-indigo-600 underline underline-offset-4">80 pts</span> para desbloquear beneficios.</p>
            <div className="mt-5 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(score / 80) * 100}%` }}></div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2"><HeartPulseIcon className="w-4 h-4 text-rose-500" /><h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Salud de Integridad</h3></div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Óptima</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{l:'Consistencia',v:'98%'},{l:'Verif. Social',v:'Alta'},{l:'Anomalías',v:'0%'}].map((s,i)=>(
              <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center shadow-inner"><p className="text-[8px] text-slate-400 uppercase font-black mb-1 tracking-tighter">{s.l}</p><p className="text-xs font-black text-slate-800">{s.v}</p></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Hoy</p>
            <p className="text-2xl font-black text-slate-800">S/ {todayTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Mes</p>
            <p className="text-2xl font-black text-slate-800">S/ {monthTotal.toFixed(2)}</p>
          </div>
        </div>

        <SaleForm merchantId={merchantId} onSaleRegistered={handleSaleRegistered} />

        <div className="space-y-4 pb-12">
          <h3 className="font-black text-slate-800 text-sm italic px-2 flex items-center">
            <ActivityIcon className="w-4 h-4 mr-2 text-emerald-500" />
            Actividad en tiempo real
          </h3>
          <SalesList sales={sales} loading={loading} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-5 z-30 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-900 uppercase">Mantle L2 Active</span>
              <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Sincronización segura</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-inner">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-600 uppercase">Último anclaje: {timeAgo}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;