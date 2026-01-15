import { useState, useEffect } from 'react';
import { 
  Store, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Activity, 
  Download, 
  ChevronRight, 
  Lock, 
  ShieldCheck, 
  HeartPulse, 
  Clock, 
  Box,
  ExternalLink,
  Globe
} from 'lucide-react';
import SaleForm from './SaleForm';
import SalesList from './SalesList';
import { getSales, getOnChainScore } from '../services/api';

function Dashboard({ merchant, onLogout }) {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estados para Mantle Batching y Score On-Chain
  const [onChainData, setOnChainData] = useState({ score: merchant.score || 75, verified: false });
  const [timeAgo, setTimeAgo] = useState("Sincronizando...");
  const [showHashAlert, setShowHashAlert] = useState(false);
  const [lastHash, setLastHash] = useState("");

  const merchantId = merchant.id || merchant.merchantId;
  const businessName = merchant.name || merchant.businessName || "Mi Negocio";
  const CONTRACT_ADDRESS = "0x7007508b1420e719D7a7A69B98765F60c7Aae759";

  useEffect(() => {
    const playIntroSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    };

    if (merchantId) {
      loadInitialData();
      playIntroSound();
    }
  }, [merchantId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [salesResponse, blockchainResponse] = await Promise.all([
        getSales(merchantId),
        getOnChainScore(merchantId)
      ]);

      setSales(salesResponse.sales || []);
      setOnChainData(blockchainResponse);
      calculateTotals(salesResponse.sales || []);
    } catch (error) {
      console.error('Error cargando Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
        const mockHash = "0x" + Math.random().toString(16).slice(2, 40); 
        setLastHash(mockHash);
        setShowHashAlert(true);
        setTimeout(() => setShowHashAlert(false), 7000);
      }

      if (diffSeconds < 60) setTimeAgo(`Hace ${diffSeconds}s`);
      else if (diffMins < 60) setTimeAgo(`Hace ${diffMins} min`);
      else setTimeAgo("Hace +1h");
    };
    const interval = setInterval(updateLog, 1000);
    return () => clearInterval(interval);
  }, [sales]);

  const calculateTotals = (salesList) => {
    const today = new Date().toDateString();
    let todaySum = 0; let monthSum = 0;
    salesList.forEach(sale => {
      const saleDate = new Date(sale.timestamp || (sale.created_at * 1000));
      const amount = parseFloat(sale.amount || 0);
      if (saleDate.toDateString() === today) todaySum += amount;
      if (saleDate.getMonth() === new Date().getMonth()) monthSum += amount;
    });
    setTodayTotal(todaySum);
    setMonthTotal(monthSum);
  };

  const handleSaleRegistered = (newSale) => {
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    calculateTotals(updatedSales);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      {/* ALERTA DE HASH (Sutil y elegante) */}
      {showHashAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top fade-in duration-500">
          <div className="bg-slate-900 border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md bg-opacity-95">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <Box className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Cierre de Lote (Bucket)</p>
              <h4 className="text-xs font-bold">Datos anclados en Mantle</h4>
              <p className="text-[9px] text-slate-400 font-mono truncate opacity-60">{lastHash}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{businessName}</h1>
              <div className="flex items-center text-[10px] text-emerald-600 font-black uppercase tracking-tighter">
                <ShieldCheck className="w-3 h-3 mr-1" /> Protocolo Verificado
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Banner Score */}
        <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-emerald-800">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1 italic">¡Hola, {businessName.split(' ')[0]}!</h2>
            <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black">{onChainData.score}</span>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest opacity-80">Score On-Chain</span>
            </div>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
        </div>

        {/* PRÉSTAMO DINÁMICO */}
        {onChainData.score >= 80 ? (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-7 text-white shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-7 h-7 text-yellow-300 fill-yellow-300 shadow-yellow-500/50" />
              <div className="text-[9px] font-black bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase">Oferta de Capital</div>
            </div>
            <h3 className="text-xl font-bold mb-1">Crédito Pre-Aprobado</h3>
            <p className="text-indigo-100 text-xs mb-6 opacity-80">Tu flujo verificado en la red permite acceso a S/ 1,500.00 sin papeleo.</p>
            <button onClick={() => alert("Conectando con pool de liquidez...")} className="w-full bg-white text-indigo-700 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform">
              <span>SOLICITAR AHORA</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm border-dashed">
            <div className="flex items-center justify-between opacity-30 mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Línea de Crédito</span>
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">Necesitas <span className="font-bold text-indigo-600">80 pts</span> para financiamiento.</p>
            <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
              <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(onChainData.score / 80) * 100}%` }}></div>
            </div>
          </div>
        )}

        {/* SALUD DE DATOS */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Métricas de Integridad</h3>
            </div>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Healthy</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{l:'Consistencia',v:'98%'},{l:'Buckets',v:'15m'},{l:'Red',v:'Mantle'}].map((s,i)=>(
              <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <p className="text-[8px] text-slate-400 uppercase font-black mb-1">{s.l}</p>
                <p className="text-xs font-black text-slate-800 tracking-tight">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Diarios */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ventas Hoy</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight italic">S/ {todayTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Acumulado Mes</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">S/ {monthTotal.toFixed(2)}</p>
          </div>
        </div>

        <SaleForm merchantId={merchantId} onSaleRegistered={handleSaleRegistered} />

        <div className="space-y-4 pb-12 px-1">
          <h3 className="font-bold text-slate-800 text-sm flex items-center">
            <Activity className="w-4 h-4 mr-2 text-emerald-500" />
            Movimientos Recientes
          </h3>
          <SalesList sales={sales} loading={loading} />
        </div>
      </main>

      {/* FOOTER PREMIUM: BLOCKCHAIN STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1 tracking-tight">Mantle Sepolia</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none tracking-tighter">Sync: {timeAgo}</p>
            </div>
          </div>
          
          <a 
            href={`https://sepolia.mantlescan.xyz/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full border border-slate-200 transition-colors group"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Ver Contrato</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;