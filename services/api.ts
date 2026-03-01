import { Order, Table, Waiter } from '../types';
import { INITIAL_TABLES, WAITERS } from '../constants';

// 🔥 APAGAMOS RENDER TEMPORALMENTE Y ENCENDEMOS TU LABORATORIO LOCAL 🔥
const API_URL = 'https://restaurante-backend-ys2q.onrender.com';
// const API_URL = 'http://localhost:8000'; // Apagamos el laboratorio local

export const api = {
    // --- 1. MESEROS Y MESAS ---
    getWaiters: async (): Promise<Waiter[]> => {
        return Promise.resolve(WAITERS);
    },

    getTables: async (): Promise<Table[]> => {
        const saved = localStorage.getItem('pos_tables');
        return saved ? JSON.parse(saved) : INITIAL_TABLES;
    },

    saveTables: async (tables: Table[]): Promise<void> => {
        localStorage.setItem('pos_tables', JSON.stringify(tables));
        return Promise.resolve();
    },

    // --- 2. CONEXIÓN CON SERVIDOR PYTHON ---
    
    // A) Obtener activos (Cocina)
    getActiveOrders: async (): Promise<Order[]> => {
        try {
            const response = await fetch(`${API_URL}/orders`);
            if (!response.ok) throw new Error('Error al conectar con cocina');
            return await response.json();
        } catch (error) {
            console.error("❌ Error obteniendo pedidos:", error);
            return [];
        }
    },

    // B) Obtener Historial (Admin) 
    getTodaysOrders: async (): Promise<Order[]> => {
        try {
            const response = await fetch(`${API_URL}/orders/all`);
            if (!response.ok) throw new Error('Error al obtener historial');
            return await response.json();
        } catch (error) {
            console.error("❌ Error historial:", error);
            return [];
        }
    },

    // C) Obtener Historial (App.tsx)
    getOrderHistory: async (): Promise<Order[]> => {
        return api.getTodaysOrders(); 
    },

    // D) Crear Pedido (Mesero)
    createOrder: async (order: Order): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Error en el servidor');
            }
        } catch (error) {
            console.error("❌ Error enviando pedido:", error);
            throw error;
        }
    },

    // E) Completar (Chef)
    completeKitchenOrder: async (orderId: string): Promise<void> => {
        try {
            await fetch(`${API_URL}/orders/${orderId}/complete`, { method: 'POST' });
        } catch (error) {
            console.error("Error completando:", error);
        }
    },

    // F) Eliminar (Admin)
    deleteOrder: async (orderId: string): Promise<void> => {
        try {
            await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error eliminando:", error);
            throw error;
        }
    },
    
    // G) Estimar Tiempo
    setKitchenEstimate: async (orderId: string, minutes: number): Promise<void> => {
        console.log(`Estimación: ${minutes} min`);
        return Promise.resolve();
    },

    // H) Cerrar Día
    closeDay: async (): Promise<void> => {
        try {
            await fetch(`${API_URL}/close-day`, { method: 'POST' });
        } catch (error) {
            console.error("Error cerrando día:", error);
            throw error;
        }
    },

    // --- 4. SISTEMA DE LICENCIAS (KILL SWITCH) ---
    checkLicense: async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/license`);
            if (!response.ok) return false;
            const data = await response.json();
            return data.isExpired; 
        } catch (error) {
            console.error("Error verificando licencia", error);
            return false; 
        }
    }
};