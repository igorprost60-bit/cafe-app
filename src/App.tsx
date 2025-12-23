import { useEffect, useState } from 'react';
import { fetchMenu, saveOrder, Category, Product, CartItem } from './lib/db';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { OrderConfirmation } from './components/OrderConfirmation';
import { ShoppingCart } from 'lucide-react';

type PageType = 'menu' | 'confirmation';

function App() {
  const [page, setPage] = useState<PageType>('menu');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const loadMenu = async () => {
      const { categories, products } = await fetchMenu();
      setCategories(categories);
      setProducts(products);
      setLoading(false);
    };

    loadMenu();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.product.id !== productId)
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Загрузка меню...</p>
      </div>
    );
  }

  if (page === 'confirmation') {
    return (
      <OrderConfirmation
        orderId={orderId}
        onNewOrder={handleNewOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Система заказов
          </h1>

          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-slate-700">
              {cart.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Menu
              categories={categories}
              products={products}
              onAddToCart={handleAddToCart}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Cart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onPlaceOrder={handlePlaceOrder}
                isLoading={orderLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
