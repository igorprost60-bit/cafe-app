import { Product } from '../../lib/db';
import { ToggleRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onToggle: (isActive: boolean) => void;
}

export function ProductCard({ product, onToggle }: ProductCardProps) {
  const isActive = product.is_active !== false;

  return (
    <div
      className={`p-4 rounded-lg border transition ${
        isActive
          ? 'bg-white border-slate-200'
          : 'bg-slate-100 border-slate-300 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-16 h-16 object-cover rounded mb-2"
            />
          )}
          <h3 className="font-semibold text-slate-900">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="text-sm font-semibold text-slate-900 mt-2">
            ${(product.price / 100).toFixed(2)}
          </p>
        </div>

        <button
          onClick={() => onToggle(!isActive)}
          className={`p-2 rounded transition ${
            isActive
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-300 text-slate-600 hover:bg-slate-400'
          }`}
          title={isActive ? 'Деактивировать' : 'Активировать'}
        >
          <ToggleRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
