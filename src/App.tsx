import { useEffect, useState } from 'react';
import { fetchMenu, saveOrder, Category, Product, CartItem } from './lib/db';
import { Menu } from './components/Menu';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartPage } from './pages/CartPage';
import { ShoppingCart } from 'lucide-react';

type PageType = 'menu' | 'cart' | 'confirmation';

function App() {
  const [page, setPage] = useState<PageType>('menu');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

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

  /* ---------- ORDER ---------- */
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setOrderLoading(true);
    const result = await saveOrder(cart);
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
        onPlaceOrder={handlePlaceOrder}
        isLoading={orderLoading}
      />
    );
  }

  /* ---------- CONFIRMATION ---------- */
  if (page === 'confirmation') {
    return (
      <OrderConfirmation
        orderId={orderId}
        onNewOrder={handleNewOrder}
      />
    );
  }

  /* ---------- MENU PAGE ---------- */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Система заказов
          </h1>

          {/* CART BUTTON */}
          <div
            onClick={() => setPage('cart')}
            className="cursor-pointer flex items-center gap-2 bg-white rounded-xl shadow px-4 py-2"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-slate-800">
              {cart.length}
            </span>
          </div>
        </div>

        {/* MENU */}
        <Menu
          categories={categories}
          products={products}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </div>
    </div>
  );
}

export default App;
