import { useMemo, useState } from 'react';
import { Category, Product, CartItem } from '../lib/db';
import { Plus, Minus } from 'lucide-react';

interface MenuProps {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Beverages: 'Напитки',
  Snacks: 'Закуски',
};

export function Menu({
  categories,
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
}: MenuProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?.id
  );

  // productId → quantity
  const cartMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const activeProducts = products.filter(
    (p) => p.category_id === activeCategoryId
  );

  return (
    <div className="space-y-8">
      {/* ===== CATEGORY TABS ===== */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold transition
                ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {CATEGORY_LABELS[category.name] ?? category.name}
            </button>
          );
        })}
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
                <h3 className="text-lg font-bold mb-1">
                  {product.name}
                </h3>
                <p className="text-2xl font-extrabold text-purple-600 mb-6">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </div>

              {/* BUTTON / COUNTER */}
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
                    onClick={() =>
                      onUpdateQuantity(product.id, quantity - 1)
                    }
                    className="p-2 rounded-lg bg-white shadow"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-lg">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      onUpdateQuantity(product.id, quantity + 1)
                    }
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
