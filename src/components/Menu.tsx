import { useMemo, useEffect, useState } from 'react';
import { Category, Product, CartItem } from '../lib/db';
import { CartControl } from './CartControl';

interface MenuProps {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export function Menu({
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onSelectProduct,
}: MenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  /* ---------- INIT ACTIVE CATEGORY ---------- */
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  /* ---------- CART MAP ---------- */
  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  /* ---------- ACTIVE PRODUCTS ---------- */
  const activeProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter((p) => p.category_id === activeCategoryId);
  }, [products, activeCategoryId]);

  /* ---------- CATEGORY LABEL ---------- */
  const getCategoryLabel = (category: Category) => {
    // @ts-expect-error possible future field
    const displayName = category.display_name as string | undefined;
    return displayName?.trim() || category.name || 'Категория';
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-600">Категории не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ===== CATEGORY TABS ===== */}
      <div className="sticky top-0 z-30 bg-slate-50 -mx-4 px-4 pt-4 pb-3">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-semibold transition
                  ${
                    isActive
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-white text-slate-700 border hover:bg-slate-100'
                  }`}
              >
                {getCategoryLabel(category)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== PRODUCTS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeProducts.map((product) => {
          const quantity = cartMap[product.id] ?? 0;

          return (
            <div
              key={product.id}
              className="rounded-2xl overflow-hidden shadow bg-white
              aspect-[9/14] flex flex-col"
            >
              {/* IMAGE */}
              <button
                onClick={() => onSelectProduct(product)}
                className="flex-1 bg-slate-100 overflow-hidden cursor-pointer hover:opacity-80 transition"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </button>

              {/* BOTTOM PANEL */}
              <div className="px-3 py-2 border-t border-slate-100">
                {/* Название */}
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-slate-900">
                  {product.name}
                </h3>

                {/* Цена */}
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  ${(product.price / 100).toFixed(2)}
                </p>

                {/* Кнопки */}
                <div className="mt-1 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="text-xs text-slate-500 hover:text-slate-900 transition"
                  >
                    Подробнее →
                  </button>

                  <CartControl
                    product={product}
                    quantity={quantity}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
