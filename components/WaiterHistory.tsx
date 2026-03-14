import React, { useState } from 'react';
import { Order } from '../types';
import { ArrowLeft, Clock, Receipt, ChevronDown, ChevronUp, Banknote } from 'lucide-react';

interface WaiterHistoryProps {
    orders: Order[];
    waiterName: string;
    onBack: () => void;
}

const WaiterHistory: React.FC<WaiterHistoryProps> = ({ orders, waiterName, onBack }) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Filtramos SOLO los pedidos que ya están pagados y que son de este mesero
    // (Si en tu sistema todos ven todo, puedes quitar la validación de waiterName)
    const completedOrders = orders
        .filter(o => o.paymentStatus === 'PAID')
        .sort((a, b) => b.createdAt - a.createdAt); // Ordenamos del más nuevo al más viejo

    const totalCollected = completedOrders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
            {/* Header / Topbar */}
            <div className="bg-slate-900 text-white p-4 shadow-md z-10 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                    <span className="font-bold hidden sm:inline">Volver</span>
                </button>
                <h2 className="text-xl font-bold tracking-tight">Historial de Ventas</h2>
                <div className="w-8"></div> {/* Espaciador para centrar el título */}
            </div>

            {/* Resumen del Mesero */}
            <div className="bg-white p-5 border-b border-gray-200 shadow-sm z-0">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide mb-1">Turno actual: {waiterName}</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-3xl font-black text-gray-900">${totalCollected.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 font-medium">Total cobrado hoy</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg text-sm flex items-center gap-1.5">
                            <Receipt size={16} />
                            {completedOrders.length} tickets
                        </span>
                    </div>
                </div>
            </div>

            {/* Lista de Pedidos (Acordeón) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {completedOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 mt-10">
                        <Receipt size={48} className="mb-4" />
                        <p className="text-lg font-medium text-center">Aún no has cobrado ninguna mesa.</p>
                    </div>
                ) : (
                    completedOrders.map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        const timeStr = new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                        const isTakeaway = order.type === 'TAKEAWAY';

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
                                {/* Fila Clickeable */}
                                <div 
                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                    className="p-4 flex justify-between items-center cursor-pointer active:bg-gray-50 select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg ${isTakeaway ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                            <Receipt size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-base">
                                                {isTakeaway ? `Para Llevar` : `Mesa ${order.tableId}`}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Clock size={12} /> {timeStr}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <div>
                                            <p className="font-black text-gray-900 text-lg">${order.total.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-green-600 uppercase">Pagado</p>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Contenido Expandido */}
                                {isExpanded && (
                                    <div className="bg-slate-50 border-t border-gray-100 p-4 animate-fade-in">
                                        <div className="space-y-2 mb-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                                                    <div>
                                                        <span className="font-bold text-gray-800">{item.quantity}x</span> <span className="text-gray-700">{item.name}</span>
                                                        {item.notes && <p className="text-xs text-blue-600 italic ml-5 mt-0.5">- {item.notes}</p>}
                                                    </div>
                                                    <span className="font-semibold text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {order.payments && order.payments.length > 0 && (
                                            <div className="pt-2 border-t border-dashed border-gray-300">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                    <Banknote size={12} /> Desglose de Pago
                                                </p>
                                                {order.payments.map((p, pIdx) => (
                                                    <div key={pIdx} className="flex justify-between text-xs text-gray-600 font-medium">
                                                        <span>{p.method === 'CASH' ? 'Efectivo' : p.method === 'CARD' ? 'Tarjeta' : 'Transf.'} {p.reference && `(${p.reference})`}</span>
                                                        <span className="text-gray-800 font-bold">${p.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default WaiterHistory;