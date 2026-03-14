import React, { useMemo, useState } from 'react';
import { MENU_ITEMS } from '../constants';
import { Order, OrderItem, Product, Category } from '../types';
import { Trash2, Plus, Minus, Save, CheckCircle, ArrowLeft, Search, UtensilsCrossed, Beer, Coffee, Sandwich, ReceiptText, User } from 'lucide-react';

interface OrderPadProps {
  currentOrder: Order;
  onUpdateOrder: (order: Order) => void;
  onSave: () => void;
  onFinish: () => void;
  onBack: () => void;
  title: string;
  waiterName: string;
  onRequestSauceSelection: (product: Product) => void;
  onRequestCustomization: (product: Product) => void;
}

// UI Type only, includes 'Todos'
type UiCategory = Category | 'Todos';

const CATEGORIES: UiCategory[] = ['Todos', 'Hamburguesas', 'Hotdogs', 'Superburros', 'Boneless', 'Alitas', 'Papas', 'Salchichas', 'Bebidas','Tortas'];

// Create a dedicated, stable component for rendering icons.
const CategoryIcon: React.FC<{ category: Category }> = ({ category }) => {
    switch (category) {
        case 'Hamburguesas': return <UtensilsCrossed size={16} />;
        case 'Hotdogs': return <Sandwich size={16} />;
        case 'Alitas': return <UtensilsCrossed size={16} />;
        case 'Boneless': return <UtensilsCrossed size={16} />;
        case 'Bebidas': return <Beer size={16} />;
        case 'Papas': return <Coffee size={16} />;
        case 'Salchichas': return <Sandwich size={16} />;
        case 'Superburros': return <UtensilsCrossed size={16} />;
        default: return <Coffee size={16} />;
    }
};

interface TicketContentProps {
  currentOrder: Order;
  updateQuantity: (itemId: string, delta: number, notes?: string) => void;
  onSave: () => void;
  onFinish: () => void;
}

const TicketContent: React.FC<TicketContentProps> = ({ currentOrder, updateQuantity, onSave, onFinish }) => {
  
  // 🔥 AQUÍ CREAMOS LA RED DE SEGURIDAD
  const handleConfirmSave = () => {
    if (window.confirm('¿Seguro que quieres pasar el pedido a cocina?')) {
        onSave();
    }
  };

  return (
    <>
      {/* Order Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {currentOrder.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 space-y-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <UtensilsCrossed size={32} />
            </div>
            <p className="font-medium text-center px-8">Selecciona productos del menú para comenzar el pedido</p>
          </div>
        ) : (
          currentOrder.items.map(item => (
            <div key={`${item.id}-${item.notes}`} className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-3 flex justify-between items-start">
                  <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-800 leading-tight text-sm">{item.name}</p>
                      {item.notes && <p className="text-xs text-blue-600 font-semibold mt-1">{item.notes}</p>}
                      <p className="text-xs text-gray-500 mt-1 font-mono">${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className="bg-gray-50 p-2 flex items-center justify-between border-t border-gray-100">
                  <button 
                      onClick={() => updateQuantity(item.id, -1, item.notes)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                      {item.quantity === 1 ? <Trash2 size={16}/> : <Minus size={16}/>}
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-slate-700">{item.quantity}</span>
                  <button 
                      onClick={() => updateQuantity(item.id, 1, item.notes)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-green-50 hover:text-green-600 hover:border-green-200 shadow-sm transition-colors"
                  >
                      <Plus size={16}/>
                  </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Totals & Actions */}
      <div className="border-t border-gray-200 p-5 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-500 font-medium pb-1">Total a Pagar</span>
          <span className="text-4xl font-extrabold text-slate-900">${currentOrder.total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleConfirmSave} // 🔥 AHORA APUNTA A NUESTRA FUNCIÓN
            disabled={currentOrder.items.length === 0}
            className="flex flex-col items-center justify-center bg-white border-2 border-amber-400 text-amber-600 hover:bg-amber-50 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Save className="mb-1 w-5 h-5" />
            <span className="text-sm">Guardar y Salir</span>
          </button>
          <button
            onClick={onFinish}
            disabled={currentOrder.items.length === 0}
            className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <CheckCircle className="mb-1 w-5 h-5" />
            <span className="text-sm">Cobrar</span>
          </button>
        </div>
      </div>
    </>
  );
};


export const OrderPad: React.FC<OrderPadProps> = ({ 
  currentOrder, 
  onUpdateOrder, 
  onSave, 
  onFinish,
  onBack,
  title,
  waiterName,
  onRequestSauceSelection,
  onRequestCustomization,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<UiCategory>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTicketVisible, setIsTicketVisible] = useState(false);

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    let products = MENU_ITEMS;
    
    if (selectedCategory !== 'Todos') {
      products = products.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lowerTerm));
    }

    return products;
  }, [selectedCategory, searchTerm]);

  const addItem = (product: Product) => {
    // 1. Identificamos qué productos llevan qué cosa
    const customItemsIds = ['pa_2', 'pa_3', 'pa_4', 'bn_3', 'bn_5']; // Salchipapas, Papas boneless, Ensalada
    const customCategories = ['Hamburguesas', 'Hotdogs', 'Tortas'];
    const sauceItemsIds = ['ham_9', 'hd_19', 'hd_20', 'bn_3', 'bn_5']; // Hamburguesa/Dogo/Papas/Ensalada Boneless

    const needsCustomization = customCategories.includes(product.category) || customItemsIds.includes(product.id);
    const needsSauce = product.category === 'Boneless' || product.category === 'Alitas' || sauceItemsIds.includes(product.id);

    // 2. Si lleva personalización, abrimos ese modal PRIMERO
    if (needsCustomization) {
      onRequestCustomization(product);
      return;
    }

    // 3. Si solo lleva salsa (ej. Orden de Boneless), abrimos salsa
    if (needsSauce) {
      onRequestSauceSelection(product);
      return;
    }

    // 4. Si NO lleva nada (Bebidas, Salchicha Sola, Orden Papas), entra LIMPIO
    const existingItemIndex = currentOrder.items.findIndex(i => i.id === product.id && !i.notes);
    let newItems = [...currentOrder.items];
    if (existingItemIndex >= 0) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push({ ...product, quantity: 1, notes: '' }); // NOTA VACÍA
    }
    
    recalculateTotal(newItems);
  };

  const updateQuantity = (itemId: string, delta: number, notes?: string) => {
    const newItems = currentOrder.items.map(item => {
      if (item.id === itemId && item.notes === notes) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    recalculateTotal(newItems);
  };

  const recalculateTotal = (items: OrderItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    onUpdateOrder({ ...currentOrder, items, total });
  };
  
  const getCategoryStyles = (cat: Category) => {
     switch(cat) {
        case 'Hamburguesas': return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
        case 'Hotdogs': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100';
        case 'Boneless': return 'border-red-200 bg-red-50 hover:bg-red-100';
        case 'Alitas': return 'border-red-200 bg-red-50 hover:bg-red-100';
        case 'Superburros': return 'border-amber-200 bg-amber-50 hover:bg-amber-100';
        case 'Papas': return 'border-lime-200 bg-lime-50 hover:bg-lime-100';
        case 'Salchichas': return 'border-pink-200 bg-pink-50 hover:bg-pink-100';
        case 'Bebidas': return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
        default: return 'border-gray-200 bg-white hover:bg-gray-50';
     }
  };

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* LEFT SIDE: PRODUCT SELECTION */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-300 relative">
        
        {/* Header Navigation */}
        <div className="bg-white p-4 shadow-sm z-10 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
            </button>
            <h2 className="text-base md:text-xl font-bold text-gray-800 truncate px-2">{title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} /> 
                <span className="font-bold">{waiterName}</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Buscar producto..." 
               className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-300 rounded-xl transition-all outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white px-4 pb-4 border-b border-gray-200">
          <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-sm transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {filteredProducts.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                <Search size={64} className="mb-4" />
                <p className="text-lg font-medium">No se encontraron productos</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
              {filteredProducts.map(product => {
                const quantityInCart = currentOrder.items.filter(i => i.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addItem(product)}
                    className={`
                      relative p-3 md:p-4 rounded-xl shadow-sm transition-all active:scale-95 flex flex-col justify-between h-40 md:h-44 border-2
                      group text-left
                      ${getCategoryStyles(product.category)}
                      ${quantityInCart > 0 ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-200' : ''}
                    `}
                  >
                    {quantityInCart > 0 && (
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md animate-bounce">
                            {quantityInCart}
                        </div>
                    )}
                    
                    <div className="w-full">
                        <div className="flex items-center gap-1 text-xs opacity-60 font-bold uppercase mb-1 tracking-wider">
                            <CategoryIcon category={product.category} />
                            {product.category}
                        </div>
                        <span className="font-bold text-gray-800 text-base md:text-lg leading-tight block">
                            {/* FIX: Removed redundant String() call. */}
                            {product.name}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-end w-full mt-2">
                       <span className="text-lg md:text-xl font-extrabold text-slate-700">${product.price.toFixed(2)}</span>
                       <div className={`
                           p-2 rounded-full transition-colors shadow-sm
                           ${quantityInCart > 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 group-hover:text-blue-600 group-hover:bg-white'}
                       `}>
                          <Plus size={20} />
                       </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
        
      {/* DESKTOP TICKET */}
      <div className="w-full md:w-96 bg-white hidden md:flex flex-col h-full shadow-2xl z-20 border-l border-gray-200">
        <div className="bg-slate-900 text-white p-5 shadow-lg z-10">
            <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-xl tracking-tight">Ticket</h3>
                <span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-200 font-mono border border-slate-600">
                    {currentOrder.items.length} items
                </span>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentOrder.type === 'DINE_IN' ? 'bg-green-500' : 'bg-purple-500'}`}></span>
                {currentOrder.type === 'DINE_IN' ? 'Comer Aquí' : 'Para Llevar'}
            </p>
        </div>
        <TicketContent 
            currentOrder={currentOrder}
            updateQuantity={updateQuantity}
            onSave={onSave}
            onFinish={onFinish}
        />
      </div>
      
      {/* MOBILE TICKET OVERLAY */}
      {isTicketVisible && (
          <div className="fixed inset-0 z-30 bg-white flex flex-col md:hidden animate-slide-up">
            <div className="bg-slate-900 text-white p-5 shadow-lg z-10 flex items-center justify-between">
                <button onClick={() => setIsTicketVisible(false)} className="flex items-center gap-2 text-slate-300 hover:text-white">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Menú</span>
                </button>
                <h3 className="font-bold text-xl tracking-tight">Ticket</h3>
                 <span className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-200 font-mono border border-slate-600">
                    {currentOrder.items.length} items
                </span>
            </div>
             <TicketContent 
                currentOrder={currentOrder}
                updateQuantity={updateQuantity}
                onSave={onSave}
                onFinish={onFinish}
            />
          </div>
      )}

      {/* MOBILE FLOATING ACTION BUTTON */}
      <div className="md:hidden">
          <button 
            onClick={() => setIsTicketVisible(true)}
            disabled={currentOrder.items.length === 0}
            className="fixed bottom-5 right-5 bg-blue-600 text-white rounded-full shadow-2xl h-16 w-auto px-6 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
              <ReceiptText size={24} />
              <div className="text-left">
                <span className="font-bold text-lg">${currentOrder.total.toFixed(2)}</span>
                <span className="block text-xs opacity-80 -mt-1">{currentOrder.items.length} items</span>
              </div>
          </button>
      </div>

    </div>
  );
};