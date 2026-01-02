import { Product, CartItem } from '../lib/db';
import { ChevronLeft } from 'lucide-react';
import { CartControl } from '../components/CartControl';

interface ProductDetailPageProps {
  product: Product;
  cart: CartItem[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function ProductDetailPage({
  product,
  cart,
  onBack,
  onAddToCart,
  onUpdateQuantity,
}: ProductDetailPageProps) {
  const quantity =
    cart.find((item) => item.product.id === product.id)?.quantity ?? 0;

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

              {/* CART CONTROL */}
              <div className="mt-6 flex justify-start">
                <CartControl
                  product={product}
                  quantity={quantity}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
