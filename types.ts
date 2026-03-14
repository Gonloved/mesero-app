export type Category = 'Hamburguesas' | 'Hotdogs' | 'Superburros' | 'Boneless' | 'Alitas' | 'Papas' | 'Salchichas' | 'Bebidas' | 'Tortas';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
}

// 🔥 NUEVO: Interfaz para los pagos individuales
export interface Payment {
    method: 'CASH' | 'CARD' | 'TRANSFER';
    amount: number;
    reference?: string; // Para los 4 dígitos de la tarjeta
    tip?: number; // 🔥 NUEVO: Propina individual de este pago
}

export interface OrderItem extends Product {
  quantity: number;
  notes?: string;
  round?: number;    // <--- (Ronda de pedidor)
  destination?: 'AQUI' | 'LLEVAR'; // <--- Destino específico del item
}

export interface Order {
  id: string; // Unique ID for the order
  type: 'DINE_IN' | 'TAKEAWAY';
  status: 'OPEN' | 'COMPLETED' | 'KITCHEN_DONE';
  items: OrderItem[];
  total: number;
  createdAt: number;
  waiterName: string; // Name of the waiter who took the order
  customerName?: string; // For takeaway
  tableId?: number | string; // Para dine-in (Acepta string o number para compatibilidad con Admin)
  
  // Variables de pago tradicionales
  paymentStatus: 'PAID' | 'UNPAID';
  amountPaid?: number;
  change?: number;
  paidBalance?: number; 
  
  // 🔥 NUEVAS: Soporte para cuentas separadas
  paymentMethod?: string; 
  payments?: Payment[]; // La lista de pagos divididos
}

export interface Table {
  id: number;
  label: string;
  status: 'AVAILABLE' | 'OCCUPIED';
  currentOrderId?: string | null;
  waiterName?: string; // Name of the waiter who opened the table
}

export interface Waiter {
    id: string;
    name: string;
    pin: string;
}

export enum ViewMode {
  LOGIN = 'LOGIN',
  EMPLOYEE_SELECT = 'EMPLOYEE_SELECT',
  TABLES = 'TABLES',
  TAKEAWAY = 'TAKEAWAY',
  ORDER_PAD = 'ORDER_PAD',
  HISTORY = 'HISTORY' // 🔥 Agrega esta línea
}

// 🔥 NUEVO: Agregado al Mesero para que ambos archivos hablen el mismo idioma al 100%
export interface DaySummary {
    id: string;
    startTime: number;
    endTime: number;
    totalOrders: number;
    totalSales: number;
    totalCash: number;      
    totalCard: number;      
    totalTransfer: number;  
    archivedOrders: Order[]; // El paquete con todos los pedidos del día
}