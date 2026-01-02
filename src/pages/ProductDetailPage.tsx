import { Product } from '../lib/db';
import { ShoppingCart, ChevronLeft } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductDetailPage({
  product,
  onBack,
  onAddToCart,
}: ProductDetailPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* IMAGE */}
            <div className="flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden aspect-square">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
            </div>

            {/* INFO */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {product.name}
                </h1>

                <p className="text-5xl font-bold text-slate-900 mb-6">
                  ${(product.price / 100).toFixed(2)}
                </p>

                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">
                      Описание
                    </h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* ADD TO CART BUTTON */}
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl
                hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
