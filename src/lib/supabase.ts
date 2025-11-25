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
