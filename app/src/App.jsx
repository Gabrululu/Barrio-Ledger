import { useState, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { getMerchantData, saveMerchantData } from './services/storage';

function App() {
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const data = await getMerchantData();
        if (data) {
          setMerchant(data);
        }
      } catch (error) {
        console.error('Error loading merchant:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMerchant();
  }, []);

  const handleRegister = async (merchantData) => {
    // merchantData viene del backend ya con su id (ej. 0x999888777)
    try {
      await saveMerchantData(merchantData);
      setMerchant(merchantData);
    } catch (error) {
      alert("Error al guardar los datos del registro localmente.");
    }
  };

  const handleLogout = () => {
    if (confirm('¿Seguro que quieres cerrar sesión? Tus datos locales se borrarán.')) {
      localStorage.clear();
      setMerchant(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Conectando con Barrio Ledger...</p>
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