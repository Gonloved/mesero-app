import React, { useState, useEffect } from 'react';
import WaiterPOS from './components/WaiterPOS'; // O como se llame tu componente principal
import { api } from './services/api';
import { Lock, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const verifyLicense = async () => {
      const expired = await api.checkLicense();
      setIsExpired(expired);
      setIsChecking(false);
    };
    verifyLicense();
  }, []);

  // 1. Pantalla de carga mientras pregunta a la base de datos
  if (isChecking) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 size={48} className="animate-spin mb-4 text-teal-600" />
        <p className="font-medium text-lg tracking-wide">Iniciando sistema...</p>
      </div>
    );
  }

  // 2. 🔥 LA PANTALLA ROJA DE LA MUERTE (Si no pagaron) 🔥
  if (isExpired) {
    return (
      <div className="h-screen w-screen bg-red-600 flex flex-col items-center justify-center text-white p-6 z-[100] relative overflow-hidden">
        {/* Un pequeño efecto visual de fondo */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-red-700/50 p-6 rounded-full border-4 border-red-500 mb-8 shadow-2xl">
            <Lock size={80} className="text-red-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-center mb-6 drop-shadow-lg">Software Bloqueado</h1>
          <p className="text-lg md:text-xl text-center max-w-md bg-red-800/60 p-6 rounded-2xl border border-red-500 shadow-xl font-medium">
            La licencia de uso para este establecimiento ha expirado. Por favor, comunícate con tu proveedor de software para renovar tu mensualidad y reactivar el sistema.
          </p>
        </div>
      </div>
    );
  }

  // 3. Si todo está en orden, muestra la app normal
  return <WaiterPOS />;
};

export default App;