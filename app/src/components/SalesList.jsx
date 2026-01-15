import { Banknote, Smartphone, Clock, CheckCircle2, Timer } from 'lucide-react';

function SalesList({ sales, loading }) {
  const formatTime = (dateValue) => {
    if (!dateValue) return 'Ahora';
        
    const date = new Date(dateValue.timestamp || dateValue.created_at || dateValue);
    
    if (isNaN(date.getTime())) return 'Reciente';

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
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 font-medium">Sin actividad comercial</p>
        <p className="text-xs text-gray-400">Las ventas que realices aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sales.slice(0, 20).map((sale) => {
        // Normalizamos el método de pago (backend usa paymentMethod, mock usa payment_method)
        const method = (sale.paymentMethod || sale.payment_method || 'cash').toLowerCase();
        
        return (
          <div
            key={sale.id}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 hover:border-green-100 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                method === 'cash' ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                {method === 'cash' ? (
                  <Banknote className="w-5 h-5 text-amber-600" />
                ) : (
                  <Smartphone className="w-5 h-5 text-blue-600" />
                )}
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  S/ {parseFloat(sale.amount).toFixed(2)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {method === 'cash' ? 'Efectivo' : 'Pago Digital'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 mb-1">
                {formatTime(sale.timestamp || sale.created_at)}
              </p>
              {/* Mostramos Sincronizado si viene de la DB real, Pendiente si es Mock */}
              {sale.id.toString().length > 5 ? (
                <div className="flex items-center justify-end text-[10px] font-bold text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  <span>SYNC</span>
                </div>
              ) : (
                <div className="flex items-center justify-end text-[10px] font-bold text-amber-500">
                  <Timer className="w-3 h-3 mr-1" />
                  <span>MANTLE PENDING</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SalesList;