import { useEffect, useState } from 'react';
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

  const handleBack = () => {
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
  onClick={() => {
    setView('list');
    setSelectedCategory(null);
  }}
  className="p-2 rounded hover:bg-slate-200 transition"
>
  <ArrowLeft className="w-5 h-5 text-slate-700" />
</button>


          <h1 className="text-3xl font-bold text-slate-900">
            Админка
          </h1>
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
        onBack={handleBack}
        onSuccess={() => {
          loadData();
          handleBack();
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
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            {selectedCategory.name}
          </h1>

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
                    adminToggleProductActivity(product.id, isActive).then(() => {
                      loadData();
                    });
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

/* ---------- COMPONENTS ---------- */

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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">Добавить категорию</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Название категории
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Напитки"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg
            hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

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
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let imageUrl: string | null = null;

    if (image) {
      const uploadResult = await adminUploadImage(image);
      if (!uploadResult.success) {
        setError(uploadResult.error || 'Ошибка при загрузке изображения');
        setLoading(false);
        return;
      }
      imageUrl = uploadResult.url || null;
    }

    const result = await adminCreateProduct(
      categoryId,
      name,
      parseFloat(price) * 100,
      description || null,
      imageUrl,
      isActive
    );

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Ошибка при создании товара');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Добавить товар</h1>
        <p className="text-slate-600 mb-6">{categoryName}</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Название товара
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Кофе"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание товара"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Цена ($)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Изображение (опционально)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
                disabled={loading}
              />
              <label
                htmlFor="image-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                    <span className="text-xs text-slate-600">Кликните для изменения</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-sm text-slate-600">Кликните для загрузки</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`p-2 rounded transition ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              <ToggleRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900">
              {isActive ? 'Активен' : 'Неактивен'}
            </span>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg
            hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onToggle,
}: {
  product: Product;
  onToggle: (isActive: boolean) => void;
}) {
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
