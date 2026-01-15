import { useState } from 'react';
import { Banknote, Smartphone, Check, Plus } from 'lucide-react';
import { registerSale } from '../services/api';

function SaleForm({ apiKey, onSaleRegistered }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await registerSale({
        amount: parseFloat(amount),
        paymentMethod,
        apiKey
      });

      if (response.success) {
        setSuccess(true);
        
        onSaleRegistered({
          id: response.sale.id,
          amount: response.sale.amount,
          payment_method: paymentMethod,
          created_at: response.sale.timestamp || Math.floor(Date.now() / 1000)
        });

        setTimeout(() => {
          setAmount('');
          setSuccess(false);
        }, 1500);
      }
    } catch (error) {
      alert('Error al registrar venta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <Plus className="w-5 h-5 text-green-600" />
        <span>Registrar Venta</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Tabs */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Método de Pago</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'cash', label: 'Efectivo', icon: Banknote, color: 'amber' },
              { id: 'digital', label: 'Digital', icon: Smartphone, color: 'blue' }
            ].map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === method.id
                    ? `border-${method.color}-500 bg-${method.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <method.icon className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === method.id ? `text-${method.color}-600` : 'text-gray-400'
                }`} />
                <span className={`text-sm font-semibold ${
                  paymentMethod === method.id ? `text-${method.color}-900` : 'text-gray-600'
                }`}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Monto (S/)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 text-2xl font-bold text-center bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Montos frecuentes</p>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 100].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-lg disabled:cursor-not-allowed"
        >
          {success ? (
            <>
              <Check className="w-6 h-6" />
              <span>¡Venta Registrada!</span>
            </>
          ) : loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              <span>Registrar Venta</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default SaleForm;