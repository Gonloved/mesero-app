import React, { useState, useEffect } from 'react';
import { Order, Payment } from '../types'; 
import { Banknote, CreditCard, Smartphone, X, Plus, Trash2 } from 'lucide-react';

interface PaymentModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (payments: Payment[]) => void; // Volvemos a la versión sencilla
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, isOpen, onClose, onConfirm }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [method, setMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
    const [amountStr, setAmountStr] = useState('');
    const [reference, setReference] = useState('');

    const orderTotal = order?.total || 0;
    const previouslyPaid = order?.paidBalance || 0; 
    const currentOwed = Math.max(0, orderTotal - previouslyPaid); 
    
    // Total pagado en esta sesión de cobro
    const sessionTotalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, currentOwed - sessionTotalPaid);
    const isFullyPaid = sessionTotalPaid >= currentOwed;

    // 🔥 LA MAGIA DEL CAMBIO INTELIGENTE
    const overpayment = Math.max(0, sessionTotalPaid - currentOwed); // Cuánto dinero sobró en total
    const cashPaid = payments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0); // Cuánto dieron en físico
    // Solo devolvemos cambio si hay excedente Y ese excedente puede ser cubierto por el efectivo que nos dieron
    const physicalChangeToReturn = Math.min(overpayment, cashPaid); 

    useEffect(() => {
        if (isOpen && order) {
            setPayments([]);
            setMethod('CASH');
            setAmountStr('');
            setReference('');
        }
    }, [isOpen, order]);

    const handleAddPayment = () => {
        const amt = parseFloat(amountStr);

        if (isNaN(amt) || amt <= 0) return alert("Ingresa un monto válido");
        if (method === 'CARD' && reference.length > 0 && reference.length < 4) {
            return alert("Si ingresas tarjeta, pon los últimos 4 dígitos completos o déjalo en blanco");
        }

        const newPayment: Payment = { 
            method, 
            amount: amt, 
            reference: reference.trim() || undefined 
        };

        setPayments([...payments, newPayment]);
        
        setAmountStr('');
        setReference('');
    };

    const handleRemovePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleFinalConfirm = () => {
        // 🔥 LA DOBLE CONFIRMACIÓN QUE PEDISTE
        if (window.confirm('¿Seguro que quiere finalizar el cobro?')) {
            onConfirm(payments);
        }
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">Cobrar Pedido</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="text-center mb-6">
                        <p className="text-gray-500 text-sm uppercase tracking-wide font-bold">Saldo restante</p>
                        <p className="text-4xl font-black text-gray-900">${currentOwed.toFixed(2)}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button onClick={() => setMethod('CASH')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${method === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            <Banknote size={24} className="mb-1" /> Efectivo
                        </button>
                        <button onClick={() => setMethod('CARD')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${method === 'CARD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            <CreditCard size={24} className="mb-1" /> Tarjeta
                        </button>
                        <button onClick={() => setMethod('TRANSFER')} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${method === 'TRANSFER' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            <Smartphone size={24} className="mb-1" /> Transf.
                        </button>
                    </div>

                    {/* FORMULARIO DE PAGO */}
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase">Monto cobrado</label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                <input 
                                    type="number" 
                                    value={amountStr}
                                    onChange={(e) => setAmountStr(e.target.value)}
                                    className="w-full pl-7 pr-2 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 font-bold text-lg"
                                    placeholder={remaining > 0 ? remaining.toFixed(2) : "0.00"}
                                />
                            </div>
                        </div>

                        <div>
                            {/* Recordatorio visual para el cajero */}
                            <label className="text-[11px] font-bold text-gray-500 uppercase flex justify-between">
                                <span>{method === 'CARD' ? 'Últimos 4 dígitos / Nota' : 'Nota / Referencia (Opcional)'}</span>
                            </label>
                            <input 
                                type="text" 
                                value={reference}
                                onChange={(e) => setReference(e.target.value)} 
                                className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 font-medium text-sm"
                                placeholder={method === 'CARD' ? "Ej. 1234 (Dejó $10 propina)" : "Ej. Pagó Juan"}
                            />
                        </div>

                        <button 
                            onClick={handleAddPayment}
                            disabled={!amountStr}
                            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
                        >
                            <Plus size={18} /> Agregar Pago
                        </button>
                    </div>

                    {/* LISTA DE PAGOS */}
                    {payments.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Pagos registrados:</p>
                            <div className="space-y-2">
                                {payments.map((p, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {p.method === 'CASH' && <Banknote size={18} className="text-green-600"/>}
                                            {p.method === 'CARD' && <CreditCard size={18} className="text-blue-600"/>}
                                            {p.method === 'TRANSFER' && <Smartphone size={18} className="text-purple-600"/>}
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {p.method === 'CASH' ? 'Efectivo' : p.method === 'CARD' ? 'Tarjeta' : 'Transferencia'}
                                                </p>
                                                {p.reference && <p className="text-xs text-gray-500">Nota: {p.reference}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900">${p.amount.toFixed(2)}</span>
                                            <button onClick={() => handleRemovePayment(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-600 text-sm">Resta por pagar:</span>
                        <span className={`text-lg font-black ${remaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ${remaining.toFixed(2)}
                        </span>
                    </div>

                    {/* Solo mostramos el cambio si hubo un pago en efectivo que lo justifique */}
                    {physicalChangeToReturn > 0 && (
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-green-700 text-sm">Dar cambio físico:</span>
                            <span className="text-lg font-black text-green-700">
                                ${physicalChangeToReturn.toFixed(2)}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleFinalConfirm}
                        disabled={!isFullyPaid}
                        className={`w-full py-4 rounded-xl font-extrabold text-lg uppercase tracking-wider transition-all shadow-lg mt-2 ${isFullyPaid ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isFullyPaid ? 'Finalizar Cobro' : 'Falta dinero'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;