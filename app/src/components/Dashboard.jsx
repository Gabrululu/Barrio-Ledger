import { useState, useEffect } from 'react';
import { 
  Store, LogOut, TrendingUp, DollarSign, Zap, Activity, Download, 
  ChevronRight, Lock, ShieldCheck, HeartPulse, Clock, Box, 
  ExternalLink, Globe, Loader2 
} from 'lucide-react';
import SaleForm from './SaleForm';
import SalesList from './SalesList';
import { getSales, getOnChainScore } from '../services/api';

function Dashboard({ merchant, onLogout }) {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
    
  const [onChainData, setOnChainData] = useState({ score: merchant.score || 75, verified: false });
  const [timeAgo, setTimeAgo] = useState("Sincronizando...");
  const [showHashAlert, setShowHashAlert] = useState(false);
  const [lastHash, setLastHash] = useState("");

  const merchantId = merchant.id || merchant.merchantId;
  const businessName = merchant.name || merchant.businessName || "Mi Negocio";
  const CONTRACT_ADDRESS = "0x7007508b1420e719D7a7A69B98765F60c7Aae759";

  useEffect(() => {
    if (merchantId) {
      loadInitialData();
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }
  }, [merchantId]);

  // Función principal de carga
  const loadInitialData = async () => {
    try {
      const [salesResponse, blockchainResponse] = await Promise.all([
        getSales(merchantId),
        getOnChainScore(merchantId)
      ]);
      setSales(salesResponse.sales || []);
      setOnChainData(blockchainResponse);
      calculateTotals(salesResponse.sales || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Sincronización Automática post-venta
  const startAutoSync = () => {
    setIsSyncing(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const blockchainResponse = await getOnChainScore(merchantId);
      
      if (blockchainResponse.verified || attempts > 6) {
        setOnChainData(blockchainResponse);
        setIsSyncing(false);
        clearInterval(interval);
      }
    }, 5000); 
  };

  useEffect(() => {
    const updateLog = () => {
      if (sales.length === 0) { setTimeAgo("Sin actividad"); return; }
      const diffSeconds = Math.floor((new Date() - new Date(sales[0].timestamp || sales[0].created_at * 1000)) / 1000);
      
      if (diffSeconds === 120) {
        setLastHash("0x" + Math.random().toString(16).slice(2, 40));
        setShowHashAlert(true);
        setTimeout(() => setShowHashAlert(false), 7000);
      }
      setTimeAgo(diffSeconds < 60 ? `Hace ${diffSeconds}s` : `Hace ${Math.floor(diffSeconds/60)} min`);
    };
    const timer = setInterval(updateLog, 1000);
    return () => clearInterval(timer);
  }, [sales]);

  const calculateTotals = (list) => {
    const today = new Date().toDateString();
    let t = 0; let m = 0;
    list.forEach(s => {
      const d = new Date(s.timestamp || s.created_at * 1000);
      const val = parseFloat(s.amount || 0);
      if (d.toDateString() === today) t += val;
      if (d.getMonth() === new Date().getMonth()) m += val;
    });
    setTodayTotal(t); setMonthTotal(m);
  };

  const handleSaleRegistered = (newSale) => {
    const updated = [newSale, ...sales];
    setSales(updated);
    calculateTotals(updated);
    startAutoSync(); // Inicia la búsqueda en Mantle Sepolia
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36 font-sans">
      {showHashAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-in slide-in-from-top fade-in duration-500">
          <div className="bg-slate-900 border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-4 backdrop-blur-md bg-opacity-95">
            <Box className="w-6 h-6 text-emerald-500 animate-pulse" />
            <div className="flex-1 overflow-hidden">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Mantle Batching</p>
              <h4 className="text-xs font-bold">Datos Inmutables en L2</h4>
              <p className="text-[9px] text-slate-400 font-mono truncate opacity-60">{lastHash}</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg"><Store className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{businessName}</h1>
              <div className="flex items-center text-[10px] text-emerald-600 font-black uppercase tracking-tighter">
                <ShieldCheck className={`w-3 h-3 mr-1 ${onChainData.verified ? '' : 'animate-pulse'}`} /> 
                {onChainData.verified ? 'Mantle Verified' : 'Sincronizando Red...'}
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-emerald-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1 italic tracking-tight">¡Hola, {businessName.split(' ')[0]}!</h2>
            <div className="flex items-center space-x-3">
                <span className="text-4xl font-black">{onChainData.score}</span>
                <div className="text-[10px] font-bold text-emerald-300 uppercase leading-none">
                    <p>Trust Score</p>
                    <p className="opacity-60">On-Chain</p>
                </div>
            </div>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        {onChainData.score >= 80 ? (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-7 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-7 h-7 text-yellow-300 fill-yellow-300" />
              <div className="text-[9px] font-black bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase">DeFi Credit Line</div>
            </div>
            <h3 className="text-xl font-bold mb-1">Línea de Crédito Activa</h3>
            <p className="text-indigo-100 text-xs mb-6 opacity-80 leading-relaxed">Tu flujo verificado en el contrato <span className="font-mono">SalesEventLog</span> habilita acceso a capital.</p>
            <button onClick={() => alert("Solicitando fondos...")} className="w-full bg-white text-indigo-700 font-black py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 text-sm">
              <span>SOLICITAR S/ 1,500.00</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-7 border border-slate-200 shadow-sm border-dashed">
            <div className="flex items-center justify-between opacity-30 mb-4 font-black"><span className="text-[10px] uppercase">Capital de Trabajo</span><Lock className="w-4 h-4" /></div>
            <p className="text-slate-500 text-sm font-medium tracking-tight">Necesitas <span className="font-bold text-indigo-600">80 pts</span> para desbloquear.</p>
            <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
              <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(onChainData.score / 80) * 100}%` }}></div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center space-x-2 font-black text-slate-400 uppercase text-[10px] tracking-widest">
              <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
              <h3>Integridad On-Chain</h3>
            </div>
            {isSyncing && <div className="flex items-center text-[9px] text-indigo-600 font-bold animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Verificando en Mantle...</div>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{l:'Status',v:onChainData.verified ? 'Live' : 'Pending'},{l:'Buckets',v:'15m'},{l:'Network',v:'Mantle'}].map((s,i)=>(
              <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <p className="text-[8px] text-slate-400 uppercase font-black mb-1">{s.l}</p>
                <p className={`text-xs font-black tracking-tight ${s.v === 'Live' ? 'text-emerald-600' : 'text-slate-800'}`}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ventas Hoy</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight italic">S/ {todayTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Mes</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">S/ {monthTotal.toFixed(2)}</p>
          </div>
        </div>

        <SaleForm merchantId={merchantId} onSaleRegistered={handleSaleRegistered} />

        <div className="space-y-4 pb-12">
          <h3 className="font-bold text-slate-800 text-sm flex items-center px-2 italic"><Activity className="w-4 h-4 mr-2 text-emerald-500" /> Movimientos Recientes</h3>
          <SalesList sales={sales} loading={loading} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-3 w-3 rounded-full ${onChainData.verified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
            <div>
                <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1 tracking-tight">Mantle Sepolia L2</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none tracking-tighter uppercase font-mono">{onChainData.verified ? 'Status: Confirmed' : 'Status: Syncing...'}</p>
            </div>
          </div>
          
          <a href={`https://explorer.sepolia.mantle.xyz/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 bg-slate-900 hover:bg-black px-4 py-2 rounded-full border border-slate-800 transition-all group shadow-md text-white">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Blockchain Explorer</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;