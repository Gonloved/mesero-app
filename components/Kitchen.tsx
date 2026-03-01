import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Order } from '../types';
import { api } from '../services/api';
import { ChefHat, Clock, ShoppingBag, Utensils, X, Bell, CheckCircle, Power } from 'lucide-react';

// A simple, audible tone for notifications encoded as a data URI
const NOTIFICATION_SOUND_URI = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoD/v/i/+AD/4If/gn/+wj/8weEAgwF+gQ7BQQD5wM3AvwB+wH8AfwB/AH8AfsB/QH+Af4B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8B/wH/Af8BFix";

interface EstimateModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (minutes: number) => void;
}

const EstimateModal: React.FC<EstimateModalProps> = ({ order, onClose, onConfirm }) => {
  const [minutes, setMinutes] = useState(order.kitchenEstimate || 15);

  const handleConfirm = () => {
    onConfirm(minutes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Estimar Tiempo</h3>
          <button onClick={onClose} className="text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Para pedido: <span className="font-bold">{order.type === 'DINE_IN' ? `Mesa ${order.tableId}` : order.customerName}</span>
        </p>
        <div className="flex items-center justify-center gap-4 my-6">
          <button onClick={() => setMinutes(m => Math.max(5, m - 5))} className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold">-</button>
          <span className="text-5xl font-bold w-24 text-center">{minutes}</span>
          <button onClick={() => setMinutes(m => Math.min(60, m + 5))} className="w-12 h-12 bg-gray-100 rounded-full text-2xl font-bold">+</button>
        </div>
        <p className="text-center text-gray-500 mb-6">minutos</p>
        <button onClick={handleConfirm} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">Confirmar Tiempo</button>
      </div>
    </div>
  );
};

const TimeElapsed: React.FC<{ createdAt: number }> = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - createdAt) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const timeColor = minutes >= 15 ? 'text-red-500' : minutes >= 10 ? 'text-yellow-500' : 'text-green-500';

  return (
    <span className={`font-mono font-bold text-lg ${timeColor}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
};

interface OrderCardProps {
  order: Order;
  onComplete: (orderId: string) => void;
  onSetEstimate: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onComplete, onSetEstimate }) => {
  const cardColor = order.type === 'DINE_IN' ? 'bg-orange-50 border-orange-200' : 'bg-purple-50 border-purple-200';
  const headerColor = order.type === 'DINE_IN' ? 'bg-orange-100' : 'bg-purple-100';
  const icon = order.type === 'DINE_IN' ? <Utensils className="text-orange-600" size={24} /> : <ShoppingBag className="text-purple-600" size={24} />;
  
  const orderTitle = order.type === 'DINE_IN' ? `Mesa ${order.tableId}` : order.customerName;

  return (
    <div className={`rounded-2xl shadow-lg flex flex-col overflow-hidden border-2 ${cardColor}`}>
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${headerColor}`}>
        <div className="flex items-center gap-3">
          {icon}
          <div >
            <h3 className="text-xl font-extrabold text-gray-800">{orderTitle}</h3>
            <p className="text-sm text-gray-600 font-medium">Por: {order.waiterName}</p>
          </div>
        </div>
        <TimeElapsed createdAt={order.createdAt} />
      </div>

      {/* Items */}
      <div className="p-4 flex-1 space-y-3 bg-white overflow-y-auto">
        {order.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <p className="font-bold text-gray-800">
                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-md">{item.quantity}x</span>
                {item.name}
              </p>
              {item.notes && <p className="text-sm text-blue-600 font-semibold pl-8 mt-1 italic">"{item.notes}"</p>}
            </div>
            <span className="text-sm text-gray-500 font-medium">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onSetEstimate(order)} 
          className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-bold py-3 rounded-lg border border-blue-200 transition-colors shadow-sm"
        >
          <Clock size={18} />
          {order.kitchenEstimate ? `${order.kitchenEstimate} min` : 'Estimar'}
        </button>
        <button 
          onClick={() => onComplete(order.id)}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-green-200"
        >
          <CheckCircle size={18} />
          Listo
        </button>
      </div>
    </div>
  );
};

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderForEstimate, setOrderForEstimate] = useState<Order | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrderIds = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const activeOrders = await api.getActiveOrders();
      
      const kitchenOrders = activeOrders.filter(o => o.status === 'OPEN');
      
      // Notification logic
      const currentOrderIds = new Set(kitchenOrders.map(o => o.id));
      if (prevOrderIds.current.size > 0) {
        const newOrders = kitchenOrders.filter(o => !prevOrderIds.current.has(o.id));
        if (newOrders.length > 0) {
          notificationAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
        }
      }
      prevOrderIds.current = currentOrderIds;
      
      setOrders(kitchenOrders);
    } catch (err) {
      setError("No se pudo conectar con el servidor. Reintentando...");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    
    // Setup audio element
    if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio(NOTIFICATION_SOUND_URI);
    }

    return () => clearInterval(interval);
  }, [fetchOrders]);
  
  const handleCompleteOrder = async (orderId: string) => {
    try {
      await api.completeKitchenOrder(orderId);
      fetchOrders();
    } catch (e) {
      console.error("Failed to complete order:", e);
      alert("Error al marcar el pedido como listo.");
    }
  };

  const handleSetEstimate = async (minutes: number) => {
    if (!orderForEstimate) return;
    try {
      await api.setKitchenEstimate(orderForEstimate.id, minutes);
      setOrderForEstimate(null);
      fetchOrders();
    } catch (e) {
      console.error("Failed to set estimate:", e);
      alert("Error al guardar la estimación.");
    }
  };

  const handleCloseDay = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar el día? Esta acción finalizará la jornada y no se podrán registrar más pedidos.")) {
        try {
            await api.closeDay();
            alert("El día se ha cerrado correctamente.");
            window.location.reload();
        } catch (e) {
            console.error("Failed to close day:", e);
            alert("Error al cerrar el día. Por favor, inténtalo de nuevo.");
        }
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => a.createdAt - b.createdAt);
  }, [orders]);

  return (
    <div className="h-screen w-screen bg-gray-800 text-white flex flex-col overflow-hidden">
      {orderForEstimate && (
        <EstimateModal
          order={orderForEstimate}
          onClose={() => setOrderForEstimate(null)}
          onConfirm={handleSetEstimate}
        />
      )}
      <header className="bg-gray-900 p-4 shadow-lg z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <ChefHat size={32} className="text-orange-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">Pantalla de Cocina</h1>
        </div>
        <div className="flex items-center gap-6">
            {error && <p className="text-red-400 font-semibold">{error}</p>}
            <div className="flex items-center gap-4">
              <div className="text-right">
                  <p className="font-bold text-lg">{sortedOrders.length}</p>
                  <p className="text-sm text-gray-400">Pedidos Pendientes</p>
              </div>
              <Bell size={24} className={`transition-colors ${sortedOrders.length > 0 ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}`} />
            </div>
            <button 
              onClick={handleCloseDay}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Power size={18} />
              Cerrar Día
            </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-400">Cargando pedidos...</p>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="p-12 bg-gray-900/50 rounded-2xl">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-300">¡Todo listo!</h2>
              <p className="text-gray-400 mt-2">No hay pedidos pendientes.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {sortedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onComplete={handleCompleteOrder}
                onSetEstimate={(orderToEstimate) => setOrderForEstimate(orderToEstimate)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDisplay;
