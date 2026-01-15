import { useState, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { getMerchantData, saveMerchantData } from './services/storage';

function App() {
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load merchant data from localStorage
    const loadMerchant = async () => {
      try {
        const data = await getMerchantData();
        setMerchant(data);
      } catch (error) {
        console.error('Error loading merchant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMerchant();
  }, []);

  const handleRegister = async (merchantData) => {
    await saveMerchantData(merchantData);
    setMerchant(merchantData);
  };

  const handleLogout = () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      localStorage.clear();
      setMerchant(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!merchant ? (
        <RegisterForm onRegister={handleRegister} />
      ) : (
        <Dashboard merchant={merchant} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;