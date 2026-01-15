import { Banknote, Smartphone, Clock } from 'lucide-react';

function SalesList({ sales, loading }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Ventas</h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Ventas</h2>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aún no hay ventas registradas</p>
          <p className="text-sm text-gray-400 mt-1">Registra tu primera venta arriba</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Últimas Ventas ({sales.length})
      </h2>
      
      <div className="space-y-2">
        {sales.slice(0, 20).map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                sale.payment_method === 'cash'
                  ? 'bg-amber-100'
                  : 'bg-blue-100'
              }`}>
                {sale.payment_method === 'cash' ? (
                  <Banknote className="w-5 h-5 text-amber-600" />
                ) : (
                  <Smartphone className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Info */}
              <div>
                <p className="font-semibold text-gray-900">
                  S/ {sale.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {sale.payment_method === 'cash' ? 'Efectivo' : 'Digital'}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {formatTime(sale.created_at)}
              </p>
              {sale.synced ? (
                <p className="text-xs text-green-600">✓ Sincronizado</p>
              ) : (
                <p className="text-xs text-amber-600">⏳ Pendiente</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {sales.length > 20 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Mostrando últimas 20 ventas
        </p>
      )}
    </div>
  );
}

export default SalesList;