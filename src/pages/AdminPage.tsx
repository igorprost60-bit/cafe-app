import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Category,
  Product,
  adminFetchAll,
  adminCreateCategory,
  adminCreateProduct,
  adminToggleProductActivity,
  adminUploadImage,
} from '../lib/db';
import { Plus, ArrowLeft, Upload, ToggleRight } from 'lucide-react';

type View = 'list' | 'add-category' | 'add-product' | 'category-products';

export function AdminPage() {
  const navigate = useNavigate();

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

  const backToList = () => {
    setView('list');
    setSelectedCategory(null);
  };

  /* ---------- LIST VIEW ---------- */
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded hover:bg-slate-200 transition"
              aria-label="Назад в меню"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Админка</h1>
          </div>

          {loading ? (
            <p className="text-slate-500">Загрузка...</p>
          ) : (
            <div className="space-y-4">
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
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {products.filter((p) => p.category_id === cat.id).length} товаров
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- ADD CATEGORY VIEW ---------- */
  if (view === 'add-category') {
    return (
      <AddCategoryForm
        onBack={backToList}
        onSuccess={() => {
          loadData();
          backToList();
        }}
      />
    );
  }

  /* ---------- CATEGORY PRODUCTS VIEW ---------- */
  if (view === 'category-products' && selectedCategory) {
    const categoryProducts = products.filter(
      (p) => p.category_id === selectedCategory.id
    );

    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={backToList}
              className="p-2 rounded hover:bg-slate-200 transition"
              aria-label="Назад"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              {selectedCategory.name}
            </h1>
          </div>

          <button
            onClick={() => setView('add-product')}
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg
            hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-2 mb-6"
          >
            <Plus className="w-5 h-5" />
            Добавить товар
          </button>

          <div className="grid gap-3">
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
      </div>
    );
  }

  /* ---------- ADD PRODUCT VIEW ---------- */
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

/* ---------- ADD CATEGORY FORM ---------- */

function AddCategoryForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await adminCreateCategory(name);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Ошибка при создании категории');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Добавить категорию
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-semibold mb-2">
            Название категории
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg"
          >
            {loading ? 'Сохранение…' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- ADD PRODUCT FORM ---------- */

function AddProductForm({
  categoryId,
  categoryName,
  onBack,
  onSuccess,
}: {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl: string | null = null;

    if (image) {
      const upload = await adminUploadImage(image);
      if (!upload.success) {
        setError(upload.error || 'Ошибка загрузки');
        setLoading(false);
        return;
      }
      imageUrl = upload.url || null;
    }

    const result = await adminCreateProduct(
      categoryId,
      name,
      Math.round(parseFloat(price) * 100),
      description || null,
      imageUrl,
      isActive
    );

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Ошибка создания товара');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Добавить товар
          </h1>
        </div>

        <p className="text-slate-600 mb-4">{categoryName}</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <input
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="number"
            placeholder="Цена"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />

          {imagePreview && (
            <img src={imagePreview} className="w-24 h-24 object-cover rounded" />
          )}

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2"
          >
            <ToggleRight />
            {isActive ? 'Активен' : 'Неактивен'}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg"
          >
            {loading ? 'Сохранение…' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- PRODUCT CARD ---------- */

function ProductCard({
  product,
  onToggle,
}: {
  product: Product;
  onToggle: (isActive: boolean) => void;
}) {
  const isActive = product.is_active !== false;

  return (
    <div className={`p-4 border rounded-lg ${!isActive && 'opacity-60'}`}>
      <h3 className="font-semibold">{product.name}</h3>
      <p>${(product.price / 100).toFixed(2)}</p>
      <button onClick={() => onToggle(!isActive)}>
        {isActive ? 'Отключить' : 'Включить'}
      </button>
    </div>
  );
}
