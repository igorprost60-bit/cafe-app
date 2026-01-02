import { CartItem } from '../lib/db';
import { ArrowLeft } from 'lucide-react';

interface CartPageProps {
  items: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export function CartPage({
  items,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}: CartPageProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Корзина</h1>
        </div>

        {/* Cart items */}
        <div className="space-y-4 mb-6">
          {items.length === 0 && (
            <p className="text-slate-500 text-center">
              Корзина пуста
            </p>
          )}

          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-slate-500 text-sm">
                  {(item.product.price / 100).toFixed(2)} €
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="px-2 text-lg"
                >
                  −
                </button>

                <span className="min-w-[20px] text-center">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    onUpdateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="px-2 text-lg"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold">Итого</span>
              <span className="font-bold">
                {(total / 100).toFixed(2)} €
              </span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Перейти к оформлению
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
