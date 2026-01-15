import { useState } from 'react';
import { Store, MapPin, Phone, ArrowRight } from 'lucide-react';
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
        merchantId: response.id || `0x${formData.phone}`,
        businessName: response.name || formData.businessName,
        location: response.location || formData.location,
        apiKey: response.apiKey || 'dummy-key-2025' 
      });

    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Score de Barrio</h1>
          <p className="text-gray-600 text-lg">Tu calificación financiera descentralizada</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="987654321"
                  className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Negocio
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Bodega Don Pepe"
                  className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Miraflores, Lima"
                  className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Registrar Bodega</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">🔒 Seguridad:</span> Los datos se registran en la infraestructura de Mantle para tu score financiero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;