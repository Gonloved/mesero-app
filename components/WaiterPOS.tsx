import React, { useState, useMemo, useEffect } from 'react';
import { ViewMode, Table, Order, Waiter, Product, OrderItem, Payment } from '../types'; 
import WaiterHistory from './WaiterHistory'; // 🔥 Importamos la nueva pantalla
import { ScrollText } from 'lucide-react'; // 🔥 Importamos un ícono de ticket/historial (asegúrate de que esté en tu lista de imports de lucide-react)
import { App as CapacitorApp } from '@capacitor/app';
import { 
  SAUCES, 
  HAMBURGER_INGREDIENTS, 
  HOTDOG_PACENO_INGREDIENTS, 
  HOTDOG_NORMAL_INGREDIENTS, 
  PAPAS_BONELESS_INGREDIENTS, 
  ENSALADA_BONELESS_INGREDIENTS, 
  TORTA_INGREDIENTS, 
  CUSTOMIZABLE_INGREDIENTS 
} from '../constants';
import { api } from '../services/api';
import { OrderPad } from './OrderPad'; 
import PaymentModal from './PaymentModal'; // 🔥 AQUÍ IMPORTAMOS TU NUEVO COMPONENTE

import { 
  Utensils, ShoppingBag, ArrowLeft, LayoutGrid, PlusCircle, Clock, 
  X, CheckCheck, Trash2, User, LogOut, Delete, LoaderCircle, MessageSquareQuote
} from 'lucide-react';

// --- LOGIN COMPONENTS ---

interface PinModalProps {
  waiter: Waiter;
  onClose: () => void;
  onLoginSuccess: (waiter: Waiter) => void;
}

const PinModal: React.FC<PinModalProps> = ({ waiter, onClose, onLoginSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handlePinInput = (digit: string) => {
        if (pin.length < 4) {
            setPin(pin + digit);
        }
    };
    
    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };



    

    useEffect(() => {
        if (pin.length === 4) {
            api.getWaiters().then(waiters => {
                const matchedWaiter = waiters.find(w => w.id === waiter.id && w.pin === pin);
                if (matchedWaiter) {
                    onLoginSuccess(matchedWaiter);
                } else {
                    setError(true);
                    setTimeout(() => {
                      setPin('');
                      setError(false);
                    }, 800);
                }
            });
        }
    }, [pin, waiter, onLoginSuccess]);
 useEffect(() => {
        const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            // Si el historial interno dice que hay una página anterior...
            if (canGoBack) {
                window.history.back(); // Te regresa a la pantalla anterior automáticamente
            } else {
                // Si ya estás en la pantalla principal y no hay a dónde volver, cierra la app
                CapacitorApp.exitApp();
            }
        });

        // Limpieza de memoria
        return () => {
            backButtonListener.then(listener => listener.remove());
        };
    }, []); // <-- Ya no dependemos de ninguna variable aquí
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center animate-slide-up">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
                    <X size={20} />
                </button>
                <User size={48} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-xl font-bold text-gray-900">Hola, {waiter.name}</h3>
                <p className="text-gray-500 mb-4">Ingresa tu PIN de 4 dígitos</p>

                <div className={`flex justify-center gap-3 mb-4`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 ${error ? 'border-red-500 animate-shake' : 'border-gray-300'} flex items-center justify-center`}>
                            {pin[i] && <div className="w-4 h-4 bg-gray-700 rounded-full"></div>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                        <button key={d} onClick={() => handlePinInput(d.toString())} className="h-16 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold transition-colors">
                            {d}
                        </button>
                    ))}
                    <div/>
                    <button onClick={() => handlePinInput('0')} className="h-16 bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-bold transition-colors">
                        0
                    </button>
                    <button onClick={handleBackspace} className="h-16 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                        <Delete size={24} className="text-gray-600" />
                    </button>
                </div>
            </div>
            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
              }
              .animate-shake {
                animation: shake 0.5s ease-in-out;
              }
            `}</style>
        </div>
    );
};

interface LoginScreenProps {
    onLogin: (waiter: Waiter) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
    const [waiters, setWaiters] = useState<Waiter[]>([]);

    useEffect(() => {
        api.getWaiters().then(setWaiters);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {selectedWaiter && (
                <PinModal 
                    waiter={selectedWaiter}
                    onClose={() => setSelectedWaiter(null)}
                    onLoginSuccess={onLogin}
                />
            )}
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Bienvenido</h1>
            <p className="text-lg text-gray-500 mb-8">Selecciona tu usuario para continuar</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                {waiters.map(waiter => (
                    <button
                        key={waiter.id}
                        onClick={() => setSelectedWaiter(waiter)}
                        className="group aspect-square bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 border-2 border-transparent hover:border-blue-500"
                    >
                        <div className="bg-blue-100 p-5 rounded-full group-hover:bg-blue-200 transition-colors">
                            <User size={40} className="text-blue-600" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">{waiter.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MODAL COMPONENTS ---

interface SauceSelectionModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

const SauceSelectionModal: React.FC<SauceSelectionModalProps> = ({ isOpen, product, onClose, onConfirm }) => {
  const [selectedSauces, setSelectedSauces] = useState<string[]>([]);
  const [isCombined, setIsCombined] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedSauces([]);
      setIsCombined(false);
    }
  }, [isOpen]);








  const handleSauceClick = (sauce: string) => {
    setSelectedSauces(prev => {
      if (prev.includes(sauce)) {
        return prev.filter(s => s !== sauce);
      }
      if (!isCombined) {
        return [sauce];
      }
      if (prev.length < 2) {
        return [...prev, sauce];
      }
      return prev;
    });
  };
  
  const handleConfirm = () => {
    if (selectedSauces.length === 0) return;
    let notes = '';
    if (isCombined) {
      notes = `Combinado: ${selectedSauces.join(', ')}`;
    } else {
      notes = `Salsa: ${selectedSauces[0]}`;
    }
    onConfirm(notes);
  };
  
  const maxSauces = isCombined ? 2 : 1;
  const canConfirm = selectedSauces.length > 0 && (!isCombined || selectedSauces.length === 2);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Elige la Salsa</h3>
          <button onClick={onClose} className="text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">Para: <span className="font-bold">{product.name}</span></p>

        <div className="flex items-center justify-center gap-4 mb-4 bg-gray-100 p-2 rounded-lg">
            <span className="font-medium">Una Salsa</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isCombined} onChange={() => { setIsCombined(p => !p); setSelectedSauces([]); }} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
            <span className="font-medium">Combinado (2 Salsas)</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {SAUCES.map(sauce => {
            const isSelected = selectedSauces.includes(sauce);
            const isDisabled = !isSelected && selectedSauces.length >= maxSauces;
            return (
              <button
                key={sauce}
                onClick={() => handleSauceClick(sauce)}
                disabled={isDisabled}
                className={`p-4 rounded-lg font-bold text-center transition-all border-2 ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sauce}
              </button>
            )
          })}
        </div>
        
        <button onClick={handleConfirm} disabled={!canConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Confirmar
        </button>
      </div>
    </div>
  );
};

interface IngredientCustomizationModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

const IngredientCustomizationModal: React.FC<IngredientCustomizationModalProps> = ({ isOpen, product, onClose, onConfirm }) => {
  type Step = 'initial' | 'without' | 'with';
  const [step, setStep] = useState<Step>('initial');
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [additionalNote, setAdditionalNote] = useState('');

  const productSpecificIngredients = useMemo(() => {
    if (!product) return [];
    if (product.category === 'Hamburguesas') return HAMBURGER_INGREDIENTS;
    if (product.category === 'Tortas') return TORTA_INGREDIENTS;
    if (product.id === 'hd_1' || product.id === 'hd_2') return HOTDOG_PACENO_INGREDIENTS;
    if (product.category === 'Hotdogs') return HOTDOG_NORMAL_INGREDIENTS;
    if (product.id === 'bn_3') return PAPAS_BONELESS_INGREDIENTS;
    if (product.id === 'bn_5') return ENSALADA_BONELESS_INGREDIENTS;
    return [];
  }, [product]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('initial');
        setSelectedIngredients(new Set());
        setAdditionalNote('');
      }, 200); 
    }
  }, [isOpen]);

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    const notesParts: string[] = [];

    if (selectedIngredients.size > 0) {
        const prefix = step === 'without' ? 'Sin: ' : 'Con: ';
        notesParts.push(prefix + Array.from(selectedIngredients).join(', '));
    }

    if (additionalNote.trim()) {
        notesParts.push(`Nota: ${additionalNote.trim()}`);
    }
    
    onConfirm(notesParts.join('. '));
  };

  if (!isOpen || !product) return null;

  const renderInitialStep = () => {
    const handleQuickConfirm = (baseNote: 'Con todo' | 'Sin nada') => {
        const notesParts: string[] = [baseNote];
        if (additionalNote.trim()) {
            notesParts.push(`Nota: ${additionalNote.trim()}`);
        }
        onConfirm(notesParts.join('. '));
    };

    return (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button onClick={() => handleQuickConfirm('Con todo')} className="p-6 rounded-lg font-bold text-center transition-all border-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-800">Con Todo</button>
            <button onClick={() => handleQuickConfirm('Sin nada')} className="p-6 rounded-lg font-bold text-center transition-all border-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-800">Sin Nada</button>
            <button onClick={() => setStep('without')} className="p-6 rounded-lg font-bold text-center transition-all border-2 bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800">Quitar Ingredientes</button>
            <button onClick={() => setStep('with')} className="p-6 rounded-lg font-bold text-center transition-all border-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800">Agregar Ingredientes</button>
          </div>
          <div className="relative">
            <MessageSquareQuote className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="Nota adicional para cocina..."
              rows={2}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-400 rounded-lg transition-all outline-none resize-none"
            />
          </div>
        </>
    );
  };

  const renderIngredientSelection = () => {
    const listToRender = step === 'without' ? productSpecificIngredients : CUSTOMIZABLE_INGREDIENTS;
    const canConfirm = selectedIngredients.size > 0 || additionalNote.trim() !== '';

    return (
      <div>
        <button onClick={() => setStep('initial')} className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-4 font-semibold">
          <ArrowLeft size={16} className="mr-1" />
          Volver
        </button>
        <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
          {step === 'without' ? 'Selecciona qué quitar' : 'Selecciona qué agregar'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 max-h-48 overflow-y-auto p-1">
          {listToRender.map(ingredient => {
            const isSelected = selectedIngredients.has(ingredient);
            return (
              <button
                key={ingredient}
                onClick={() => handleIngredientToggle(ingredient)}
                className={`p-3 rounded-lg font-bold text-center transition-all border-2 ${
                  isSelected 
                    ? step === 'without'
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                {ingredient}
              </button>
            )
          })}
        </div>
        
        <div className="relative mb-4">
            <MessageSquareQuote className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              placeholder="Nota adicional para cocina..."
              rows={2}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-400 rounded-lg transition-all outline-none resize-none"
            />
        </div>

        <button 
            onClick={handleConfirmSelection} 
            disabled={!canConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-green-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            Confirmar Personalización
        </button>
      </div>
    );
  }

  return (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Personalizar {product.category.slice(0, -1)}</h3>
          <button onClick={onClose} className="text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">Para: <span className="font-bold">{product.name}</span></p>
        
        {step === 'initial' ? renderInitialStep() : renderIngredientSelection()}

      </div>
    </div>
  )
};

// --- NUEVO MODAL DE DESTINO ---
interface DestinationModalProps {
  isOpen: boolean;
  productName: string;
  onConfirm: (destination: 'AQUI' | 'LLEVAR') => void;
}
const DestinationModal: React.FC<DestinationModalProps> = ({ isOpen, productName, onConfirm }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Para dónde es esto?</h3>
            <p className="text-gray-500 mb-6 font-medium">{productName}</p>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onConfirm('AQUI')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-4 rounded-xl border-2 border-orange-300 transition-colors">Para Aquí</button>
                <button onClick={() => onConfirm('LLEVAR')} className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-4 rounded-xl border-2 border-purple-300 transition-colors">Para Llevar</button>
            </div>
        </div>
      </div>
    );
}

interface TakeawayNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => void;
}

const TakeawayNameModal: React.FC<TakeawayNameModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Pedido Para Llevar</h3>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre del Cliente"
                    className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-400 rounded-lg transition-all outline-none mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleCreate} disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">Crear Pedido</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const WaiterPOS: React.FC = () => {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Waiter | null>(null);
  const [view, setView] = useState<ViewMode>(ViewMode.LOGIN);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Modals State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTakeawayNameModalOpen, setIsTakeawayNameModalOpen] = useState(false);
  const [isSauceModalOpen, setIsSauceModalOpen] = useState(false);
  const [productForSauceSelection, setProductForSauceSelection] = useState<Product | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [productForCustomization, setProductForCustomization] = useState<Product | null>(null);
  const [pendingNotes, setPendingNotes] = useState<string | null>(null);
  const [nextRoundNumber, setNextRoundNumber] = useState(1);
  const [itemForDestination, setItemForDestination] = useState<{product: Product, notes: string} | null>(null);

  // --- DATA LOADING AND PERSISTENCE ---
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [tablesData, ordersData, historyData] = await Promise.all([
                api.getTables(),
                api.getActiveOrders(),
                api.getOrderHistory(),
            ]);
            
            // 🔥 FIX: Destrabar mesas "Fantasma"
            const activeOrderIds = new Set(ordersData.map(o => o.id));
            const fixedTables = tablesData.map(t => {
                if (t.status === 'OCCUPIED' && t.currentOrderId && !activeOrderIds.has(t.currentOrderId)) {
                    return { ...t, status: 'AVAILABLE', currentOrderId: null, waiterName: undefined };
                }
                return t;
            });

            setTables(fixedTables);
            setActiveOrders(ordersData);
            setOrderHistory(historyData);
        } catch (error) {
            console.error("Error loading initial data", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);
  
  // Persist data on changes
  useEffect(() => { if(!isLoading) api.saveTables(tables); }, [tables, isLoading]);

  // --- DERIVED STATE ---
  const currentOrder = activeOrders.find(o => o.id === currentOrderId) || null;

  // --- AUTH ---
  const handleLogin = (waiter: Waiter) => {
    setCurrentUser(waiter);
    setView(ViewMode.EMPLOYEE_SELECT);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView(ViewMode.LOGIN);
    setOrderHistory([]);
  };

  // --- HELPERS ---
  const getOrderDetails = (order: Order | null): string => {
    if (!order) return '';
    if (order.type === 'DINE_IN') {
      return `Mesa ${order.tableId}`;
    }
    return order.customerName || 'Pedido para llevar';
  };

  // --- NAVIGATION ---
  const navigate = (newView: ViewMode) => {
    setCurrentOrderId(null);
    setView(newView);
  };

  // --- ORDER LIFECYCLE ---
  const updateCurrentOrder = (updatedOrder: Order) => {
    setActiveOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const saveAndExitOrderPad = async () => {
    if (!currentOrder) return;
    
    // 🔥 MAGIA ANTI-FANTASMAS: Si el pedido está vacío, lo destruimos.
    if (currentOrder.items.length === 0) {
        try {
            await api.deleteOrder(currentOrder.id); // Lo borramos del backend
        } catch (e) {
            console.error("Error borrando pedido vacío", e);
        }
        
        // Lo quitamos de la memoria del mesero
        setActiveOrders(prev => prev.filter(o => o.id !== currentOrder.id));
        
        // Liberamos la mesa para que vuelva a ponerse verde
        if (currentOrder.type === 'DINE_IN' && currentOrder.tableId) {
            setTables(prev => prev.map(t =>
                t.id === currentOrder.tableId
                ? { ...t, status: 'AVAILABLE', currentOrderId: null, waiterName: undefined }
                : t
            ));
        }
    } else {
        // SI TIENE PRODUCTOS, LO GUARDAMOS NORMALMENTE
        try {
            await api.createOrder(currentOrder);
            setActiveOrders(prev => prev.map(o => o.id === currentOrder.id ? currentOrder : o));
        } catch (e) {
            console.error("Error guardando:", e);
            alert("Error al guardar. Intenta de nuevo.");
            return; // Si hay error, no lo dejamos salir de la pantalla
        }
    }
    
    const viewToReturn = currentOrder.type === 'DINE_IN' ? ViewMode.TABLES : ViewMode.TAKEAWAY;
    navigate(viewToReturn);
  };

  const handlePayment = () => {
    if (!currentOrder || currentOrder.items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // 🔥 NUEVA LÓGICA DE COBRO CON MÚLTIPLES PAGOS
  const confirmPayment = async (payments: Payment[]) => {
    if (!currentOrder) return;

    // Todo lo que paguen se suma al balance. Si pagaron de más con tarjeta, 
    // el paidBalance quedará más alto que el total (lo cual indica propina en el corte de caja).
    const sessionTotalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const newPaidBalance = (currentOrder.paidBalance || 0) + sessionTotalPaid;

    const updatedPaymentsList = [...(currentOrder.payments || []), ...payments];

    const finalOrderState: Order = {
        ...currentOrder,
        paymentStatus: newPaidBalance >= currentOrder.total ? 'PAID' : 'UNPAID', 
        paidBalance: newPaidBalance, 
        payments: updatedPaymentsList
    };

    try {
        await api.createOrder(finalOrderState);
        setActiveOrders(prev => prev.map(o => o.id === currentOrderId ? finalOrderState : o));
        setIsPaymentModalOpen(false);
        navigate(finalOrderState.type === 'DINE_IN' ? ViewMode.TABLES : ViewMode.TAKEAWAY);
    } catch (error) {
        console.error("Error al cobrar:", error);
        alert("Error de conexión al cobrar.");
    }
  };

  const handleFreeTable = async (tableId: number, orderId: string) => {
      if (window.confirm('¿Liberar esta mesa y marcar el pedido como finalizado?')) {
          const orderToComplete = activeOrders.find(o => o.id === orderId);
          if (!orderToComplete) return;

          const completedOrder: Order = { ...orderToComplete, status: 'COMPLETED' };
          
          try {
              await api.createOrder(completedOrder);
              setOrderHistory(prev => [...prev, completedOrder]);
              setActiveOrders(prev => prev.filter(o => o.id !== orderId));
              setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'AVAILABLE', currentOrderId: null, waiterName: undefined } : t));
          } catch(e) {
              alert('Error al liberar mesa');
          }
      }
  };

  const backFromOrderPad = async () => {
    // Redirigimos el botón de "Atrás" para que use la misma lógica de limpieza
    await saveAndExitOrderPad();
  };
  
  const completeTakeawayOrder = (orderId: string) => {
    const orderToComplete = activeOrders.find(o => o.id === orderId);
  
    if (!orderToComplete) {
      return;
    }
  
    const completedOrder: Order = { ...orderToComplete, status: 'COMPLETED' };
  
    setOrderHistory(currentHistory => [...currentHistory, completedOrder]);
    api.createOrder(completedOrder);

    setActiveOrders(currentActiveOrders =>
      currentActiveOrders.filter(o => o.id !== orderId)
    );
  };
    
  const handleDeleteActiveOrder = (orderId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
        setActiveOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        api.deleteOrder(orderId).catch(err => console.error("Error deleting order", err));
    }
  };
  
  // --- MODAL HANDLERS ---
  const handleRequestSauceSelection = (product: Product) => {
    setProductForSauceSelection(product);
    setIsSauceModalOpen(true);
  };
  
  const handleRequestCustomization = (product: Product) => {
    setProductForCustomization(product);
    setIsCustomizationModalOpen(true);
  };
  
  const addCustomizedItemToOrder = (product: Product, notes: string, forceDestination?: 'AQUI' | 'LLEVAR') => {
    if (!currentOrder) return;
    
    // Si es mesa, estamos agregando algo nuevo (Ronda > 1) y aún no elegimos el destino
    if (currentOrder.type === 'DINE_IN' && nextRoundNumber > 1 && !forceDestination) {
        setItemForDestination({ product, notes });
        return; // Pausamos y mostramos el modal
    }

    const itemWithNotes: OrderItem = { 
        ...product, 
        quantity: 1, 
        notes,
        round: nextRoundNumber,
        destination: forceDestination || 'AQUI'
    };

    // Verificamos si ya existe el mismo producto con las mismas notas, ronda y destino
    const existingItemIndex = currentOrder.items.findIndex(
      i => i.id === itemWithNotes.id && 
           i.notes === itemWithNotes.notes && 
           i.round === itemWithNotes.round &&
           i.destination === itemWithNotes.destination
    );

    let newItems = [...currentOrder.items];
    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push(itemWithNotes);
    }
    
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateCurrentOrder({ ...currentOrder, items: newItems, total });
  };

  const handleConfirmDestination = (destination: 'AQUI' | 'LLEVAR') => {
    if (itemForDestination) {
        addCustomizedItemToOrder(itemForDestination.product, itemForDestination.notes, destination);
        setItemForDestination(null);
    }
  };

  const confirmCustomization = (notes: string) => {
    if (!productForCustomization) return;
    
    const needsSauce = productForCustomization.category === 'Boneless' || 
                       ['ham_9', 'hd_19', 'hd_20', 'bn_3', 'bn_5'].includes(productForCustomization.id);

    if (needsSauce) {
        setProductForSauceSelection(productForCustomization);
        setPendingNotes(notes);
        setIsCustomizationModalOpen(false);
        setIsSauceModalOpen(true);
    } else {
        addCustomizedItemToOrder(productForCustomization, notes);
        setProductForCustomization(null);
        setIsCustomizationModalOpen(false);
    }
  };

  const confirmSauceSelection = (sauceNotes: string) => {
    if (!productForSauceSelection) return;
    const finalNotes = pendingNotes ? `${pendingNotes}. ${sauceNotes}` : sauceNotes;
    
    addCustomizedItemToOrder(productForSauceSelection, finalNotes);
    
    setProductForSauceSelection(null);
    setPendingNotes(null);
    setIsSauceModalOpen(false);
    setProductForCustomization(null);
  };

  // --- EVENT HANDLERS ---
  const handleTableClick = (table: Table) => {
    if (!currentUser) return;
    let orderIdToOpen: string;

    if (table.status === 'OCCUPIED' && table.currentOrderId) {
      orderIdToOpen = table.currentOrderId;
      
      // 🔥 TRUCO DE RONDAS:
      const existingOrder = activeOrders.find(o => o.id === orderIdToOpen);
      if (existingOrder && existingOrder.items.length > 0) {
          const maxRound = Math.max(...existingOrder.items.map(i => i.round || 1));
          setNextRoundNumber(maxRound + 1);
      } else {
          setNextRoundNumber(1);
      }

    } else {
      // Mesa Nueva
      setNextRoundNumber(1);
      
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        type: 'DINE_IN',
        items: [],
        total: 0,
        status: 'OPEN',
        paymentStatus: 'UNPAID',
        tableId: table.id,
        createdAt: Date.now(),
        waiterName: currentUser.name,
      };
      setActiveOrders(prev => [...prev, newOrder]);
      setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: 'OCCUPIED', currentOrderId: newOrder.id, waiterName: currentUser.name } : t));
      orderIdToOpen = newOrder.id;
    }
    
    setCurrentOrderId(orderIdToOpen);
    setView(ViewMode.ORDER_PAD);
  };

  const handleTakeawayClick = (order: Order) => {
    // 🔥 TRUCO DE RONDAS (PARA LLEVAR)
    if (order && order.items.length > 0) {
        const maxRound = Math.max(...order.items.map(i => i.round || 1));
        setNextRoundNumber(maxRound + 1);
    } else {
        setNextRoundNumber(1);
    }
    
    setCurrentOrderId(order.id);
    setView(ViewMode.ORDER_PAD);
  };

  const handleNewTakeaway = () => {
    setIsTakeawayNameModalOpen(true);
  };

  const createNewTakeawayOrder = (name: string) => {
    if (!currentUser) return;
    
    setNextRoundNumber(1); // 🔥 Inicia en la ronda 1 para nuevos
    
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      type: 'TAKEAWAY',
      items: [],
      total: 0,
      status: 'OPEN',
      paymentStatus: 'UNPAID',
      customerName: name,
      createdAt: Date.now(),
      waiterName: currentUser.name,
    };
    setActiveOrders(prev => [...prev, newOrder]);
    setCurrentOrderId(newOrder.id);
    setIsTakeawayNameModalOpen(false);
    setView(ViewMode.ORDER_PAD);
  };

  // --- RENDER VIEWS ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
            <LoaderCircle size={48} className="animate-spin mb-4" />
            <p className="text-lg font-semibold">Cargando datos...</p>
        </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderEmployeeSelect = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between relative">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} /> 
            <span className="font-bold">{currentUser?.name || 'Mesero'}</span>
          </div>
          <span className="font-bold text-lg text-gray-700 absolute left-1/2 -translate-x-1/2">Modo Mesero</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 font-semibold hover:text-red-700">
            <LogOut size={16} />
            Salir
          </button>
      </header>
      
      {/* Ajustamos a flex-wrap para que si la pantalla es chica, se acomoden solos */}
      <div className="flex-1 flex flex-row flex-wrap items-center justify-center gap-6 p-6 overflow-y-auto">
        
        {/* BOTÓN 1: MESAS */}
        <button 
          onClick={() => setView(ViewMode.TABLES)}
          className="group w-full max-w-[280px] aspect-square bg-white rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-orange-500"
        >
          <div className="bg-orange-100 p-6 rounded-full group-hover:bg-orange-200 transition-colors">
            <Utensils size={56} className="text-orange-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Para Aquí</h2>
            <p className="text-gray-500 mt-2">Seleccionar mesa</p>
          </div>
        </button>

        {/* BOTÓN 2: LLEVAR */}
        <button 
          onClick={() => setView(ViewMode.TAKEAWAY)}
          className="group w-full max-w-[280px] aspect-square bg-white rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-purple-500"
        >
          <div className="bg-purple-100 p-6 rounded-full group-hover:bg-purple-200 transition-colors">
            <ShoppingBag size={56} className="text-purple-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Para Llevar</h2>
            <p className="text-gray-500 mt-2">Pedidos por nombre</p>
          </div>
        </button>

        {/* BOTÓN 3: EL NUEVO HISTORIAL */}
        <button 
          onClick={() => setView(ViewMode.HISTORY)}
          className="group w-full max-w-[280px] aspect-square bg-white rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-emerald-500"
        >
          <div className="bg-emerald-100 p-6 rounded-full group-hover:bg-emerald-200 transition-colors">
            <ScrollText size={56} className="text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
            <p className="text-gray-500 mt-2">Mis tickets cobrados</p>
          </div>
        </button>

      </div>
    </div>
);

  const renderTableGrid = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col">
       <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
         <button onClick={() => setView(ViewMode.EMPLOYEE_SELECT)} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5"/>
            Selección de Mesa
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} /> 
            <span className="font-bold">{currentUser.name}</span>
          </div>
      </header>
      
      <div className="p-4 md:p-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {tables.map(table => {
            const isOccupied = table.status === 'OCCUPIED';
            const order = isOccupied && table.currentOrderId ? activeOrders.find(o => o.id === table.currentOrderId) : null;
            
            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`
                  relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center shadow-md transition-all active:scale-95
                  ${isOccupied 
                    ? 'bg-red-50 border-2 border-red-500' 
                    : 'bg-white border-2 border-green-400 hover:bg-green-50'}
                `}
              >
                {order && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                        <User size={12}/>
                        {order.waiterName}
                    </div>
                )}
                <div className={`
                    w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 text-white shadow-sm
                    ${isOccupied ? 'bg-red-500' : 'bg-green-500'}
                `}>
                    <span className="text-xl md:text-2xl font-bold">{table.id}</span>
                </div>
                <span className={`font-bold text-base md:text-lg ${isOccupied ? 'text-red-700' : 'text-gray-700'}`}>
                   {table.label}
                </span>
                <span className={`text-sm font-medium mt-1 ${isOccupied ? 'text-red-500' : 'text-green-600'}`}>
                    {isOccupied ? 'PENDIENTE' : 'DISPONIBLE'}
                </span>
                {isOccupied && order && (() => {
                    const owed = order.total - (order.paidBalance || 0);
                    const isFullyPaid = owed <= 0 && order.total > 0;
                    const hasPartialPayment = (order.paidBalance || 0) > 0 && owed > 0;

                    return (
                        <div className="mt-2 w-full px-2 flex flex-col gap-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold text-center shadow-sm ${
                                isFullyPaid ? 'bg-green-100 text-green-800' : 
                                hasPartialPayment ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                            }`}>
                                ${order.total.toFixed(0)} 
                                {isFullyPaid ? ' (PAGADO)' : hasPartialPayment ? ` (Falta $${owed.toFixed(0)})` : ''}
                            </span>
                            
                            {/* BOTÓN PARA LIBERAR MESA SÓLO SI DEBE CERO */}
                            {isFullyPaid && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFreeTable(table.id, order.id);
                                    }}
                                    className="mt-1 bg-gray-800 hover:bg-black text-white text-[10px] md:text-xs py-1.5 md:py-2 rounded-lg font-bold transition-colors uppercase tracking-wide"
                                >
                                    Liberar Mesa
                                </button>
                            )}
                        </div>
                    );
                })()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTakeawayList = () => {
    const takeawayOrders = activeOrders.filter(o => o.type === 'TAKEAWAY');

    return (
      <div className="h-full bg-gray-100 flex flex-col">
         <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
         <button onClick={() => setView(ViewMode.EMPLOYEE_SELECT)} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Atrás
          </button>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5"/>
            Para Llevar
          </h2>
           <button 
            onClick={handleNewTakeaway}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm active:translate-y-0.5"
           >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">Nuevo</span>
           </button>
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full overflow-y-auto">
            {takeawayOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">No hay pedidos activos</p>
                    <button onClick={handleNewTakeaway} className="mt-4 text-blue-600 font-bold hover:underline">Crear uno nuevo</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {takeawayOrders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-left hover:border-blue-500 hover:shadow-md transition-all gap-4">
                            <div onClick={() => handleTakeawayClick(order)} className="flex items-center gap-4 cursor-pointer flex-1">
                                <div className="bg-purple-100 p-3 rounded-full hidden sm:flex">
                                    <Clock className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{getOrderDetails(order)}</h3>
                                    <p className="text-sm text-gray-500">{order.items.length} productos • Tomado por <span className="font-semibold">{order.waiterName}</span></p>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4">
                                <div className="text-right">
                                  <span className="font-bold text-xl text-gray-800">${order.total.toFixed(2)}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold block mt-1 ${
                                      order.paymentStatus === 'PAID' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                    }`}>
                                        {order.paymentStatus === 'PAID' ? 'PAGADO' : 'NO PAGADO'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {order.paymentStatus === 'PAID' ? (
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm('¿Seguro que quieres marcar este pedido como entregado?')) {
                                                  completeTakeawayOrder(order.id);
                                              }
                                          }}
                                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-sm"
                                      >
                                          <CheckCheck size={18} />
                                          Entregar
                                      </button>
                                  ) : (
                                      <button onClick={() => handleTakeawayClick(order)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors">
                                          Pagar / Editar
                                      </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteActiveOrder(order.id);
                                    }}
                                    className="p-3.5 bg-red-100 hover:bg-red-200 text-red-600 transition-colors rounded-lg"
                                    aria-label="Eliminar Pedido"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderOrderPad = () => {
    if (!currentOrder) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">No se encontró el pedido. Por favor, vuelve e inténtalo de nuevo.</p>
             <button onClick={() => setView(ViewMode.EMPLOYEE_SELECT)} className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Volver al inicio</button>
          </div>
        </div>
      );

    let title = "";
    if (currentOrder.type === 'DINE_IN') {
        const table = tables.find(t => t.id === currentOrder.tableId);
        title = table ? table.label : 'Mesa';
    } else {
        title = `Cliente: ${getOrderDetails(currentOrder)}`;
    }

    return (
      <OrderPad
        title={title}
        waiterName={currentUser.name}
        currentOrder={currentOrder}
        onUpdateOrder={updateCurrentOrder}
        onSave={saveAndExitOrderPad}
        onFinish={handlePayment}
        onBack={backFromOrderPad}
        onRequestSauceSelection={handleRequestSauceSelection}
        onRequestCustomization={handleRequestCustomization}
      />
    );
  };

  const renderHistory = () => (
      <WaiterHistory 
          // 👇 AQUÍ ESTÁ LA MAGIA: Le pasamos el historial real en lugar de las activas
          orders={orderHistory} 
          waiterName={currentUser?.name || 'Mesero'} 
          onBack={() => setView(ViewMode.EMPLOYEE_SELECT)} 
      />
  );
  const renderCurrentView = () => {
    switch (view) {
      case ViewMode.EMPLOYEE_SELECT: return renderEmployeeSelect();
      case ViewMode.TABLES: return renderTableGrid();
      case ViewMode.TAKEAWAY: return renderTakeawayList();
      case ViewMode.ORDER_PAD: return renderOrderPad();
      case ViewMode.HISTORY: return renderHistory(); // 🔥 ESTA ES LA LÍNEA NUEVA
      default: return <LoginScreen onLogin={handleLogin} />;
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <TakeawayNameModal
        isOpen={isTakeawayNameModalOpen}
        onClose={() => setIsTakeawayNameModalOpen(false)}
        onCreate={createNewTakeawayOrder}
      />
      {/* 🔥 AQUÍ ESTÁ EL NUEVO COMPONENTE CONECTADO */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={confirmPayment}
        order={currentOrder}
      />
      <SauceSelectionModal
        isOpen={isSauceModalOpen}
        onClose={() => { setIsSauceModalOpen(false); setProductForSauceSelection(null); }}
        onConfirm={confirmSauceSelection}
        product={productForSauceSelection}
      />
      <IngredientCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => { setIsCustomizationModalOpen(false); setProductForCustomization(null); }}
        onConfirm={confirmCustomization}
        product={productForCustomization}
      />
      <DestinationModal
        isOpen={!!itemForDestination}
        productName={itemForDestination?.product.name || ''}
        onConfirm={handleConfirmDestination}
      />
      {renderCurrentView()}
    </div>
  );
};

export default WaiterPOS;