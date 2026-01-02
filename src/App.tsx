import { useEffect, useState } from 'react';
import {
  fetchMenu,
  saveOrder,
  Category,
  Product,
  CartItem,
} from './lib/db';
import { Menu } from './components/Menu';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartPage } from './pages/CartPage';
import { CheckoutPage, CheckoutData } from './pages/CheckoutPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShoppingCart } from 'lucide-react';

type PageType = 'menu' | 'cart' | 'checkout' | 'confirmation' | 'product-detail';

type TgDiag = {
  hasTg: boolean;
  initData?: string;
  user?: any;
};

function App() {
  const [page, setPage] = useState<PageType>('menu');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [tgDiag, setTgDiag] = useState<TgDiag>({ hasTg: false });

  /* ---------- TELEGRAM DIAGNOSTICS ---------- */
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;

    if (tg) {
      try {
        tg.ready();
      } catch {}

      setTgDiag({
        hasTg: true,
        initData: tg.initData,
        user: tg.initDataUnsafe?.user,
      });
    }
  }, []);

  /* ---------- LOAD MENU ---------- */
  useEffect(() => {
    const loadMenu = async () => {
      const { categories, products } = await fetchMenu();
      setCategories(categories);
      setProducts(products);
      setLoading(false);
    };

    loadMenu();
  }, []);

  /* ---------- CART ACTIONS ---------- */
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  /* ---------- CHECKOUT CONFIRM ---------- */
  const handleConfirmOrder = async (data: CheckoutData) => {
    if (cart.length === 0) return;

    setOrderLoading(true);
    const telegramUserId = tgDiag.user?.id ?? null;

    const result = await saveOrder(cart, data, telegramUserId);
    setOrderLoading(false);

    if (result.success && result.orderId) {
      setOrderId(result.orderId);
      setCart([]);
      setPage('confirmation');
    } else {
      alert(`Ошибка при оформлении заказа: ${result.error}`);
    }
  };

  const handleNewOrder = () => {
    setPage('menu');
    setCart([]);
    setSelectedProduct(null);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPage('product-detail');
  };

  const handleBackFromProduct = () => {
    setSelectedProduct(null);
    setPage('menu');
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Загрузка меню…</p>
      </div>
    );
  }

  /* ---------- CART PAGE ---------- */
  if (page === 'cart') {
    return (
      <CartPage
        items={cart}
        onBack={() => setPage('menu')}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setPage('checkout')}
      />
    );
  }

  /* ---------- CHECKOUT PAGE ---------- */
  if (page === 'checkout') {
    return (
      <CheckoutPage
        items={cart}
        onBack={() => setPage('cart')}
        onConfirm={handleConfirmOrder}
        loading={orderLoading}
      />
    );
  }

  /* ---------- PRODUCT DETAIL ---------- */
  if (page === 'product-detail' && selectedProduct) {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <ProductDetailPage
          product={selectedProduct}
          cart={cart}
          onBack={handleBackFromProduct}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {cart.length > 0 && (
          <div
            onClick={() => setPage('cart')}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
          >
            <div className="relative bg-purple-600 text-white rounded-full shadow-xl p-4 hover:scale-105 transition">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cart.length}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- CONFIRMATION ---------- */
  if (page === 'confirmation') {
    return (
      <OrderConfirmation
        orderId={orderId}
        telegramUserId={tgDiag.user?.id}
        onNewOrder={handleNewOrder}
      />
    );
  }

  /* ---------- MENU PAGE ---------- */
  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-6 mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Система заказов
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <Menu
          categories={categories}
          products={products}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onSelectProduct={handleSelectProduct}
        />
      </div>

      {cart.length > 0 && (
        <div
          onClick={() => setPage('cart')}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 cursor-pointer"
        >
          <div className="relative bg-purple-600 text-white rounded-full shadow-xl p-4 hover:scale-105 transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
