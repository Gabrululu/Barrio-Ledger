import { useState } from 'react';
import { Store, MapPin, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { registerMerchant } from '../services/api';

function RegisterForm({ onRegister }) {
  const [formData, setFormData] = useState({
    phone: '',
    businessName: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.phone || !formData.businessName || !formData.location) {
        throw new Error('Todos los campos son requeridos');
      }
      
      const response = await registerMerchant(formData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      onRegister({
        id: response.id,
        merchantId: response.id,
        businessName: response.name || formData.businessName,
        location: response.location || formData.location,
        score: response.score || 75,
        stats: response.stats || {}
      });

    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Score de Barrio</h1>
          <p className="text-gray-600 font-medium">Inclusión financiera sobre Mantle</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teléfono Móvil</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="987654321"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-700"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Comercial</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Bodega Don Pepe"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-700"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Distrito / Ubicación</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Miraflores, Lima"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-700"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Validando en L2...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a mi Bodega</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="bg-emerald-50 rounded-2xl p-4 flex items-center space-x-3 border border-emerald-100">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-sm">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] text-emerald-800 font-bold leading-tight">
              Identidad protegida y respaldada por el protocolo de confianza de Mantle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;