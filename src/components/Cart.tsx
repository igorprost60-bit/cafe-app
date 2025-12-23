import { CartItem } from '../lib/db';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: () => void;
  isLoading?: boolean;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isLoading = false,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-card p-8 text-center">
        <p className="text-muted text-lg">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Список товаров */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="p-5 border-b last:border-b-0 flex justify-between items-center"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">
                {item.product.name}
              </h3>
              <p className="text-muted text-sm">
                ${(item.product.price / 100).toFixed(2)} за шт.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Минус */}
              <button
                onClick={() =>
                  onUpdateQuantity(item.product.id, item.quantity - 1)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-100"
                disabled={isLoading}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-8 text-center font-semibold text-slate-800">
                {item.quantity}
              </span>

              {/* Плюс */}
              <button
                onClick={() =>
                  onUpdateQuantity(item.product.id, item.quantity + 1)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg border text-slate-600 hover:bg-slate-100"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Удалить */}
              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Итого + кнопка */}
      <div className="bg-card rounded-xl shadow-card p-6">
        <div className="flex justify-between items-center mb-5">
          <span className="text-lg font-semibold text-slate-900">
            Итого
          </span>
          <span className="text-3xl font-extrabold text-primary">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primaryDark transition disabled:opacity-50"
        >
          {isLoading ? 'Оформляем заказ…' : 'Заказать'}
        </button>
      </div>
    </div>
  );
}
