import { useState, useEffect } from 'react';
import { Store, LogOut, TrendingUp, DollarSign, Zap, Activity } from 'lucide-react';
import SaleForm from './SaleForm';
import SalesList from './SalesList';
import { getSales } from '../services/api';

function Dashboard({ merchant, onLogout }) {
  const [sales, setSales] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await getSales(merchant.merchantId);
      setSales(data.sales || []);
      
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      
      const todaySales = (data.sales || []).filter(sale => {
        const saleDate = new Date(sale.created_at * 1000).toDateString();
        return saleDate === today;
      });
      
      const monthSales = (data.sales || []).filter(sale => {
        const saleDate = new Date(sale.created_at * 1000);
        return saleDate.getMonth() === thisMonth;
      });
      
      const todaySum = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
      const monthSum = monthSales.reduce((sum, sale) => sum + sale.amount, 0);
      
      setTodayTotal(todaySum);
      setMonthTotal(monthSum);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaleRegistered = (newSale) => {
    setSales([newSale, ...sales]);
    
    const today = new Date().toDateString();
    const saleDate = new Date(newSale.created_at * 1000 || Date.now()).toDateString();
    if (saleDate === today) {
      setTodayTotal(todayTotal + newSale.amount);
      setMonthTotal(monthTotal + newSale.amount);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 safe-top safe-bottom">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">{merchant.businessName}</h1>
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <span>📍</span>
                  <span>{merchant.location}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Today's Total */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Hoy</p>
                <p className="text-3xl font-bold text-green-900">S/ {todayTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <p className="text-xs text-green-600 flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Actualizado ahora</span>
            </p>
          </div>

          {/* Month Total */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-blue-700 mb-1">Este Mes</p>
                <p className="text-3xl font-bold text-blue-900">S/ {monthTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <p className="text-xs text-blue-600 flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>{sales.length} transacciones</span>
            </p>
          </div>
        </div>

        {/* Sale Form */}
        <SaleForm apiKey={merchant.apiKey} onSaleRegistered={handleSaleRegistered} />

        {/* Sales List */}
        <SalesList sales={sales} loading={loading} />
      </main>
    </div>
  );
}

export default Dashboard;