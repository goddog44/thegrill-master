import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  created_at: string;
  available: boolean;

}

export interface Order {
  id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status?: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
}

// Ajoutez cette interface dans src/lib/supabase.ts
export interface RestaurantTable {
  id: string;
  table_number: number;
  zone: string;
  capacity: number;
  position_x: number;
  position_y: number;
  is_available: boolean;
}

// Fonction pour récupérer les tables
export const getTables = async () => {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('table_number');
  
  if (error) throw error;
  return data;
};

// Fonction pour créer une commande avec table
export const createOrderWithTable = async (
  tableId: string,
  tableNumber: number,
  items: any[],
  totalAmount: number
) => {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      table_id: tableId,
      table_number: tableNumber,
      total_amount: totalAmount,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Ajouter les items de la commande
  const orderItems = items.map(item => ({
    order_id: data.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return data;
};