import { createClient } from '@supabase/supabase-js';
import type { CheckoutData } from '../pages/CheckoutPage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- TYPES ---------- */

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
  description?: string | null;
  image_url?: string | null;
}


export interface CartItem {
  product: Product;
  quantity: number;
}

/* ---------- FETCH MENU ---------- */

export async function fetchMenu(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('products').select('*'),
    ]);

    if (categoriesResult.error || productsResult.error) {
      throw new Error('Failed to fetch menu');
    }

    return {
      categories: categoriesResult.data || [],
      products: productsResult.data || [],
    };
  } catch (err) {
    console.error('Error fetching menu:', err);
    return { categories: [], products: [] };
  }
}

/* ---------- SAVE ORDER ---------- */

export async function saveOrder(
  items: CartItem[],
  data: CheckoutData
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    /* 1️⃣ создаём заказ */
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          total_price: totalPrice,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
          customer_address: data.address,
          customer_notes: data.notes || null,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || 'Failed to create order');
    }

    /* 2️⃣ создаём позиции заказа */
    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(itemsError.message || 'Failed to save order items');
    }

    /* 3️⃣ успех */
    return {
      success: true,
      orderId: orderData.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
