import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Order, OrderItem } from '../types';
import { api } from '../services/api';
import { 
    DollarSign, 
    ShoppingBag, 
    Utensils, 
    ClipboardList, 
    ChevronDown, 
    Trash2, 
    Clock, 
    User, 
    RefreshCw,
    Loader2
} from 'lucide-react';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg flex items-center gap-6 border-l-8 ${color}`}>
        {icon}
        <div>
            <p className="text-gray-500 font-semibold">{title}</p>
            <p className="text-4xl font-extrabold text-gray-800">{value}</p>
        </div>
    </div>
);

const OrderDetailRow: React.FC<{ item: OrderItem }> = ({ item }) => (
    <div className="flex justify-between items-start py-3 px-4 hover:bg-gray-50 rounded-md">
        <div>
            <p className="font-bold text-gray-800">{item.quantity}x {item.name}</p>
            {item.notes && <p className="text-sm text-blue-600 italic">"{item.notes}"</p>}
        </div>
        <p className="font-semibold text-gray-600">${(item.quantity * item.price).toFixed(2)}</p>
    </div>
);

const OrderAdminCard: React.FC<{ order: Order; onDelete: (orderId: string) => void; }> = ({ order, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const orderTypeColor = order.type === 'DINE_IN' ? 'border-orange-500' : 'border-purple-500';
    const orderTypeBgColor = order.type === 'DINE_IN' ? 'bg-orange-50' : 'bg-purple-50';

    const getStatusChip = (status: Order['status'], paymentStatus: Order['paymentStatus']) => {
        if (paymentStatus === 'PAID' && status === 'COMPLETED') return <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">FINALIZADO</span>;
        if (paymentStatus === 'PAID') return <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">PAGADO</span>;
        if (status === 'KITCHEN_DONE') return <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">LISTO</span>;
        return <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">ABIERTO</span>;
    };

    return (
        <div className={`bg-white rounded-2xl shadow-md border-t-4 ${orderTypeColor} transition-shadow hover:shadow-xl`}>
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                        <h3 className="font-extrabold text-xl text-gray-900">
                            {order.type === 'DINE_IN' ? `Mesa ${order.tableId}` : order.customerName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 gap-4 mt-1">
                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                            <span className="flex items-center gap-1"><User size={14} /> {order.waiterName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between">
                         <div className="text-right">
                           {getStatusChip(order.status, order.paymentStatus)}
                           <p className="font-bold text-2xl text-gray-800 mt-1">${order.total.toFixed(2)}</p>
                         </div>
                        <ChevronDown size={24} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className={`border-t-2 border-dashed ${orderTypeBgColor} p-4`}>
                    <h4 className="font-bold mb-2 text-gray-700">Desglose del Pedido:</h4>
                    <div className="space-y-2">
                        {order.items.map((item, index) => <OrderDetailRow key={`${item.id}-${index}`} item={item} />)}
                    </div>
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm('¿Seguro que quieres eliminar este pedido permanentemente?')) {
                                    onDelete(order.id);
                                }
                            }}
                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm py-2 px-3 rounded-lg transition-colors">
                            <Trash2 size={16} /> Eliminar Pedido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedOrders = await api.getTodaysOrders();
            setOrders(fetchedOrders.sort((a, b) => b.createdAt - a.createdAt)); // Sort by most recent first
            setError(null);
        } catch (err) {
            setError("No se pudieron cargar los pedidos.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleDeleteOrder = async (orderId: string) => {
        try {
            await api.deleteOrder(orderId);
            fetchOrders(); // Refresh list after deletion
        } catch(e) {
            console.error("Failed to delete order", e);
            alert("Error al eliminar el pedido.");
        }
    };

    const stats = useMemo(() => {
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        const dineInCount = orders.filter(o => o.type === 'DINE_IN').length;
        const takeawayCount = orders.filter(o => o.type === 'TAKEAWAY').length;
        return { totalSales, dineInCount, takeawayCount };
    }, [orders]);

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            <header className="bg-white p-4 shadow-md z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClipboardList size={32} className="text-teal-600" />
                    <h1 className="text-3xl font-extrabold text-gray-800">Panel de Administración</h1>
                </div>
                 <button 
                    onClick={fetchOrders} 
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                 >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Actualizar
                </button>
            </header>

            {/* Stats */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    <StatCard icon={<DollarSign size={40} className="text-green-500"/>} title="Ventas Totales" value={`$${stats.totalSales.toFixed(2)}`} color="border-green-500" />
                    <StatCard icon={<Utensils size={40} className="text-orange-500"/>} title="Pedidos en Restaurante" value={stats.dineInCount} color="border-orange-500" />
                    <StatCard icon={<ShoppingBag size={40} className="text-purple-500"/>} title="Pedidos para Llevar" value={stats.takeawayCount} color="border-purple-500" />
                </div>
            </div>

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                    {isLoading && <p className="text-center text-gray-500">Cargando pedidos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {!isLoading && orders.length === 0 && (
                        <div className="text-center text-gray-400 py-16">
                            <ClipboardList size={64} className="mx-auto mb-4" />
                            <h2 className="text-xl font-semibold">No hay pedidos registrados hoy.</h2>
                        </div>
                    )}
                    {orders.map(order => (
                        <OrderAdminCard key={order.id} order={order} onDelete={handleDeleteOrder} />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
