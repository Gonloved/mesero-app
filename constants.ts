import { Product, Table, Waiter } from './types';

export const SAUCES = ['BBQ', 'Bufalo', 'BBQ Habanero', 'Mango Habanero'];

// --- LISTAS DE INGREDIENTES ---
export const HAMBURGER_INGREDIENTS = [
  'Mayonesa', 'Lechuga', 'Cebolla cruda', 'Tomate', 'Chile', 'Mostaza', 'Catsup', 'Aguacate'
];

export const HOTDOG_PACENO_INGREDIENTS = [
  'Cebolla asada', 'Cebolla cruda', 'Chile', 'Mostaza', 'Tomate', 'Crema', 'Catsup'
];

export const HOTDOG_NORMAL_INGREDIENTS = [
  'Cebolla asada', 'Cebolla cruda', 'Mostaza', 'Chile', 'Cheesewiz', 'Tomate', 'Aguacate', 'Catsup', 'Queso rallado'
];

export const PAPAS_BONELESS_INGREDIENTS = [
  'Chipotle', 'Ranch', 'Queso parmesano'
];

export const ENSALADA_BONELESS_INGREDIENTS = [
  'Lechuga', 'Tomate', 'Pepino', 'Zanahoria', 'Apio', 'Crotones', 'Parmesano', 'Ranch'
];

export const TORTA_INGREDIENTS = [
  'Asada', 'Jamon', 'Queso chihuahua', 'Mayonesa', 'Lechuga', 'Tomate', 'Cebolla asada', 'Cebolla cruda', 'Mostaza', 'Catsup', 'Chile', 'Aguacate'
];

// Lista combinada para la opción de "Agregar"
const allIngredients = new Set([
    ...HAMBURGER_INGREDIENTS, ...HOTDOG_PACENO_INGREDIENTS, ...HOTDOG_NORMAL_INGREDIENTS, 
    ...PAPAS_BONELESS_INGREDIENTS, ...ENSALADA_BONELESS_INGREDIENTS, ...TORTA_INGREDIENTS
]);
export const CUSTOMIZABLE_INGREDIENTS = Array.from(allIngredients);

// --- DATOS DE MESEROS ---
export const WAITERS: Waiter[] = [
    { id: 'w1', name: 'Juan', pin: '1234' },
    { id: 'w2', name: 'Carlos', pin: '4567' },
    { id: 'w3', name: 'Maria', pin: '8901' },
];

export const MENU_ITEMS: Product[] = [
  // Hamburguesas
  { id: 'ham_1', name: 'Clásica', price: 80, category: 'Hamburguesas' },
  { id: 'ham_2', name: 'Clásica c/ Salchicha', price: 90, category: 'Hamburguesas' },
  { id: 'ham_3', name: '3 Quesos', price: 100, category: 'Hamburguesas' },
  { id: 'ham_4', name: 'Doble', price: 120, category: 'Hamburguesas' },
  { id: 'ham_5', name: 'Hawaiana', price: 100, category: 'Hamburguesas' },
  { id: 'ham_6', name: 'Tocino', price: 100, category: 'Hamburguesas' },
  { id: 'ham_7', name: 'Moster', price: 150, category: 'Hamburguesas' },
  { id: 'ham_8', name: 'Hamburguesa del Cheff', price: 130, category: 'Hamburguesas' },
  { id: 'ham_9', name: 'Hamburguesa Bonelees', price: 130, category: 'Hamburguesas' },

  // Hotdogs
  { id: 'hd_1', name: 'Paceño', price: 35, category: 'Hotdogs' },
  { id: 'hd_2', name: 'Paceño c/ Papas', price: 55, category: 'Hotdogs' },
  { id: 'hd_3', name: 'Normal', price: 40, category: 'Hotdogs' },
  { id: 'hd_4', name: 'Normal c/ Papas', price: 60, category: 'Hotdogs' },
  { id: 'hd_5', name: 'Especial', price: 45, category: 'Hotdogs' },
  { id: 'hd_6', name: 'Especial c/ Papas', price: 65, category: 'Hotdogs' },
  { id: 'hd_7', name: 'Embarazado', price: 60, category: 'Hotdogs' },
  { id: 'hd_8', name: 'Embarazado c/ Papas', price: 80, category: 'Hotdogs' },
  { id: 'hd_9', name: 'Costri Dogo', price: 50, category: 'Hotdogs' },
  { id: 'hd_10', name: 'Costri Dogo c/ Papas', price: 70, category: 'Hotdogs' },
  { id: 'hd_11', name: 'Asada', price: 65, category: 'Hotdogs' },
  { id: 'hd_12', name: 'Asada c/ Papas', price: 85, category: 'Hotdogs' },
  { id: 'hd_13', name: 'Tres Quesos', price: 55, category: 'Hotdogs' },
  { id: 'hd_14', name: 'Tres Quesos c/ Papas', price: 75, category: 'Hotdogs' },
  { id: 'hd_15', name: 'Dogo Burguer', price: 70, category: 'Hotdogs' },
  { id: 'hd_16', name: 'Dogo Burguer c/ Papas', price: 90, category: 'Hotdogs' },
  { id: 'hd_17', name: 'Chili Dogo', price: 50, category: 'Hotdogs' },
  { id: 'hd_18', name: 'Chili Dogo c/ Papas', price: 70, category: 'Hotdogs' },
  { id: 'hd_19', name: 'Dogo Bonelees', price: 70, category: 'Hotdogs' },
  { id: 'hd_20', name: 'Dogo Bonelees c/ Papas', price: 85, category: 'Hotdogs' },

  // Superburros
  { id: 'sb_1', name: 'Super Burro', price: 110, category: 'Superburros' },
  { id: 'sb_2', name: 'Super Quesaburro', price: 130, category: 'Superburros' },
  { id: 'sb_3', name: 'Super Quesadilla', price: 150, category: 'Superburros' },
  { id: 'sb_4', name: 'Super Burro Moster', price: 150, category: 'Superburros' },

  // Tortas (NUEVO)
  { id: 'tor_1', name: 'Torta con Papas', price: 100, category: 'Tortas' },

  // Boneless
  { id: 'bn_1', name: 'Boneless Orden (250gr)', price: 115, category: 'Boneless' },
  { id: 'bn_2', name: 'Orden de Aros de Cebolla', price: 80, category: 'Papas' },
  { id: 'bn_3', name: 'Papas Bonelees', price: 150, category: 'Boneless' },
  { id: 'bn_4', name: 'Paquete Compartas', price: 300, category: 'Boneless' },
  { id: 'bn_5', name: 'Ensalada Boneless', price: 120, category: 'Boneless' },

  // Alitas
  { id: 'al_1', name: 'Alitas 10 Piezas', price: 105, category: 'Alitas' },
  { id: 'al_2', name: 'Alitas 20 Piezas', price: 195, category: 'Alitas' },

  // Papas
  { id: 'pa_1', name: 'Orden de Papas', price: 50, category: 'Papas' },
  { id: 'pa_2', name: 'Salchipapas', price: 65, category: 'Papas' },
  { id: 'pa_3', name: 'Salchipapas c/ Carne', price: 90, category: 'Papas' },
  { id: 'pa_4', name: 'Salchipapas c/ Carne Gratinadas', price: 100, category: 'Papas' },

  // Salchichas
  { id: 'sl_1', name: 'Salchicha Sola', price: 15, category: 'Salchichas' },
  { id: 'sl_2', name: 'Salchicha Preparada', price: 25, category: 'Salchichas' },
  { id: 'sl_3', name: 'Salchicha Preparada (Jamón y Queso)', price: 35, category: 'Salchichas' },
  { id: 'sl_4', name: 'Salchicha Embarazada Preparada', price: 50, category: 'Salchichas' },

  // Bebidas
  { id: 'beb_1', name: 'Refresco', price: 25, category: 'Bebidas' },
  { id: 'beb_2', name: 'Té Jazmín de la casa', price: 25, category: 'Bebidas' },
  { id: 'beb_3', name: 'Agua Natural', price: 15, category: 'Bebidas' },
  { id: 'beb_4', name: 'Litro de Té', price: 45, category: 'Bebidas' },
];

export const INITIAL_TABLES: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  label: `Mesa ${i + 1}`,
  status: 'AVAILABLE',
  currentOrderId: null,
}));