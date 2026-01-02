import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/db';

interface CartControlProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  size?: 'sm' | 'md';
}

export function CartControl({
  product,
  quantity,
  onAddToCart,
  onUpdateQuantity,
  size = 'sm',
}: CartControlProps) {
  if (quantity === 0) {
    return (
      <button
        onClick={() => onAddToCart(product)}
        className={`rounded-full bg-slate-900 text-white
        flex items-center justify-center active:scale-95 transition
        ${size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'}`}
      >
        <ShoppingCart className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
        className="w-8 h-8 flex items-center justify-center
        rounded-full border border-slate-300"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="text-sm font-bold w-5 text-center">
        {quantity}
      </span>

      <button
        onClick={() => onUpdateQuantity(product.id, quantity + 1)}
        className="w-8 h-8 flex items-center justify-center
        rounded-full border border-slate-300"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
