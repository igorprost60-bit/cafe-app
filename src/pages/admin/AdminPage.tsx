import { useEffect, useState } from 'react';
import { Category, Product, adminFetchAll, adminToggleProductActivity } from '../../lib/db';
import { Plus, ArrowLeft } from 'lucide-react';
import { AddCategoryForm } from './AddCategoryForm';
import { AddProductForm } from './AddProductForm';
import { ProductCard } from './ProductCard';

type View = 'list' | 'add-category' | 'add-product' | 'category-products';

export function AdminPage({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await adminFetchAll();
    setCategories(data.categories);
    setProducts(data.products);
    setLoading(false);
  };

  /* ---------- LIST VIEW ---------- */
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={onExit}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              В меню
            </button>

            <h1 className="text-xl font-bold text-slate-900">
              Админка
            </h1>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {loading ? (
            <p className="text-slate-500">Загрузка...</p>
          ) : (
            <>
              <button
                onClick={() => setView('add-category')}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg
                hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить категорию
              </button>

              <div className="grid gap-3">
                {categories.length === 0 ? (
                  <p className="text-slate-500">Категорий нет</p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setView('category-products');
                      }}
                      className="p-4 bg-white border border-slate-200 rounded-lg text-left
                      hover:border-slate-400 hover:shadow transition"
                    >
                      <h3 className="font-semibold text-slate-900">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {products.filter((p) => p.category_id === cat.id).length} товаров
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ---------- ADD CATEGORY ---------- */
  if (view === 'add-category') {
    return (
      <AddCategoryForm
        onBack={() => setView('list')}
        onSuccess={() => {
          loadData();
          setView('list');
        }}
      />
    );
  }

  /* ---------- CATEGORY PRODUCTS ---------- */
  if (view === 'category-products' && selectedCategory) {
    const categoryProducts = products.filter(
      (p) => p.category_id === selectedCategory.id
    );

    return (
      <div className="min-h-screen bg-slate-50">
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => {
                setView('list');
                setSelectedCategory(null);
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад
            </button>

            <h1 className="text-xl font-bold text-slate-900">
              {selectedCategory.name}
            </h1>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => setView('add-product')}
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg
            hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Добавить товар
          </button>

          {categoryProducts.length === 0 ? (
            <p className="text-slate-500">Товаров нет</p>
          ) : (
            categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggle={(isActive) => {
                  adminToggleProductActivity(product.id, isActive).then(loadData);
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  /* ---------- ADD PRODUCT ---------- */
  if (view === 'add-product' && selectedCategory) {
    return (
      <AddProductForm
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        onBack={() => setView('category-products')}
        onSuccess={() => {
          loadData();
          setView('category-products');
        }}
      />
    );
  }

  return null;
}
