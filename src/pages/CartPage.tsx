import { CartItem } from '../lib/db';
import { ArrowLeft } from 'lucide-react';

interface CartPageProps {
  items: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: () => void;
  isLoading?: boolean;
}

export function CartPage({
  items,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isLoading = false,
}: CartPageProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-4">
        {/* Шапка */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Корзина</h1>
        </div>

        {/* Товары */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-slate-500 text-sm">
                  ${(item.product.price / 100).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity - 1)
                  }
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Итого */}
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Итого</span>
            <span className="font-bold">
              ${(total / 100).toFixed(2)}
            </span>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            {isLoading ? 'Оформляем…' : 'Заказать'}
          </button>
        </div>
      </div>
    </div>
  );
}
