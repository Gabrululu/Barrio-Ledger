import Link from 'next/link';
import { Store, BarChart2, Shield, Zap, ArrowRight, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">Score de Barrio</span>
        </div>
        <a
          href="https://explorer.sepolia.mantle.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Mantle Sepolia</span>
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Sobre Mantle Network L2</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
          El crédito que el
          <span className="text-emerald-400"> barrio</span>
          <br />
          merece.
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mb-16 leading-relaxed">
          Historial financiero on-chain para pequeños comerciantes.
          Sin banco, sin papel. Solo ventas reales ancladas en blockchain.
        </p>

        {/* Two paths */}
        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {/* Comerciante */}
          <Link
            href="/comerciante"
            className="group relative bg-emerald-500 hover:bg-emerald-400 rounded-3xl p-8 text-left transition-all duration-200 hover:scale-[1.02] shadow-2xl shadow-emerald-500/20"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Soy Comerciante</h2>
            <p className="text-emerald-100 text-sm leading-relaxed mb-5">
              Registra tus ventas diarias y construye tu score financiero para acceder a crédito.
            </p>
            <div className="flex items-center text-white font-bold text-sm">
              Abrir mi bodega
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Institución */}
          <Link
            href="/login"
            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-8 text-left transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
              <BarChart2 className="w-6 h-6 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Soy Institución</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Analiza el riesgo de comerciantes con datos verificados on-chain. Dashboard B2B.
            </p>
            <div className="flex items-center text-slate-300 font-bold text-sm">
              Acceder al dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      {/* Features strip */}
      <section className="border-t border-white/5 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Privacidad</p>
            <p className="text-[11px] text-slate-600 mt-1">Hash de teléfono, nunca datos reales</p>
          </div>
          <div>
            <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiempo Real</p>
            <p className="text-[11px] text-slate-600 mt-1">Sincronización cada 15 minutos</p>
          </div>
          <div>
            <Globe className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">On-Chain</p>
            <p className="text-[11px] text-slate-600 mt-1">Inmutable en Mantle Network</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-[11px] text-slate-700 font-medium">
        Score de Barrio &mdash; Inclusión financiera descentralizada
      </footer>
    </div>
  );
}
