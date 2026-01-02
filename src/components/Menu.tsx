import { useMemo, useEffect, useState } from 'react';
import { Category, Product, CartItem } from '../lib/db';
import { Plus, Minus } from 'lucide-react';

interface MenuProps {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function Menu({
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: MenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Если категории подгрузились — выставим первую активной (один раз)
  useEffect(() => {
    if (!activeCategoryId && categories.length > 0) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // productId → quantity
  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const activeProducts = useMemo(() => {
    if (!activeCategoryId) return [];
    return products.filter((p) => p.category_id === activeCategoryId);
  }, [products, activeCategoryId]);

  // Универсальная подпись категории (чтобы не было пустых табов)
  const getCategoryLabel = (category: Category) => {
    // @ts-expect-error: display_name может появиться позже в типах
    const displayName = category.display_name as string | undefined;
    const name = category.name as string | undefined;

    return (displayName?.trim() || name?.trim() || 'Категория');
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-600">Категории не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ===== CATEGORY TABS ===== */}
      <div className="sticky top-0 z-30 bg-slate-50 -mx-4 px-4 pt-4 pb-3">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-semibold transition
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeProducts.map((product) => {
          const quantity = cartMap[product.id] ?? 0;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                <p className="text-2xl font-extrabold text-purple-600 mb-6">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </div>

              {quantity === 0 ? (
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
                >
                  Добавить
                </button>
              ) : (
                <div className="flex items-center justify-between bg-slate-100 rounded-xl px-4 py-2">
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    className="p-2 rounded-lg bg-white shadow"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-lg">{quantity}</span>

                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    className="p-2 rounded-lg bg-white shadow"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
