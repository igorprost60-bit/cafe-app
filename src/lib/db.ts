import { createClient } from '@supabase/supabase-js';
import type { CheckoutData } from '../pages/CheckoutPage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ---------- TYPES ---------- */

export type AdminRole = 'superadmin' | 'owner' | 'admin';

export interface AdminUser {
  telegram_id: number;
  name: string;
  role: AdminRole;
  created_at?: string;
}

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
  is_active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/* ---------- ROLE MANAGEMENT ---------- */

/**
 * Получить роль пользователя по его Telegram ID
 */
export async function getAdminRole(tgId: number): Promise<AdminRole | null> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('role')
      .eq('telegram_id', tgId)
      .single();
    
    if (error || !data) return null;
    return data.role as AdminRole;
  } catch {
    return null;
  }
}

/**
 * Получить список всех администраторов (только для superadmin/owner)
 */
export async function fetchAllAdmins(): Promise<AdminUser[]> {
  const { data } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

/**
 * Добавить нового администратора/владельца
 */
export async function addAdminUser(tgId: number, name: string, role: AdminRole) {
  return await supabase
    .from('admins')
    .insert([{ telegram_id: tgId, name, role }]);
}

/**
 * Удалить пользователя из списка админов
 */
export async function removeAdminUser(tgId: number) {
  return await supabase
    .from('admins')
    .delete()
    .eq('telegram_id', tgId);
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
  data: CheckoutData,
  telegramUserId: number | null
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
          telegram_user_id: telegramUserId,
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || 'Failed to create order');
    }

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

/* ---------- ADMIN FUNCTIONS ---------- */

export async function adminFetchAll(): Promise<{
  categories: Category[];
  products: Product[];
}> {
  try {
    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
    ]);

    if (categoriesResult.error || productsResult.error) {
      throw new Error('Failed to fetch data');
    }

    return {
      categories: categoriesResult.data || [],
      products: productsResult.data || [],
    };
  } catch (err) {
    console.error('Error fetching admin data:', err);
    return { categories: [], products: [] };
  }
}

export async function adminCreateCategory(name: string): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    if (!name.trim()) {
      return { success: false, error: 'Category name is required' };
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim() }])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create category');
    }

    return { success: true, id: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function adminCreateProduct(
  categoryId: string,
  name: string,
  price: number,
  description: string | null,
  imageUrl: string | null,
  isActive: boolean = true
): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    if (!name.trim()) {
      return { success: false, error: 'Product name is required' };
    }

    if (price < 0) {
      return { success: false, error: 'Price must be non-negative' };
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          category_id: categoryId,
          name: name.trim(),
          price: Math.round(price),
          description: description?.trim() || null,
          image_url: imageUrl || null,
          is_active: isActive,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create product');
    }

    return { success: true, id: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function adminToggleProductActivity(
  productId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function adminUploadImage(
  file: File
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to upload image');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('products').getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}