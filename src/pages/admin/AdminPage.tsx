import { useEffect, useState } from 'react';
import {
  Category,
  Product,
  AdminRole,
  AdminUser,
  adminFetchAll,
  adminCreateCategory,
  adminCreateProduct,
  adminToggleProductActivity,
  adminUploadImage,
  fetchAllAdmins,
  addAdminUser,
  removeAdminUser,
} from '../../lib/db'; // Путь исправлен для папки pages/admin/
import { 
  Plus, 
  ArrowLeft, 
  Upload, 
  ToggleRight, 
  ShieldCheck, 
  Trash2, 
  UserPlus,
  Loader2 
} from 'lucide-react';

type View = 'list' | 'add-category' | 'add-product' | 'category-products' | 'manage-access';

export function AdminPage({ 
  onExit, 
  userRole 
}: { 
  onExit: () => void; 
  userRole: AdminRole | null;
}) {
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

  /* ---------- ГЛАВНЫЙ СПИСОК ---------- */
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={onExit} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-5 h-5" /> В меню
            </button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Админка 
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase font-bold">
                {userRole}
              </span>
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
          ) : (
            <>
              {/* УПРАВЛЕНИЕ ДОСТУПОМ (Только для Superadmin и Owner) */}
              {(userRole === 'superadmin' || userRole === 'owner') && (
                <button
                  onClick={() => setView('manage-access')}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Управление доступом
                </button>
              )}

              <button
                onClick={() => setView('add-category')}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Добавить категорию
              </button>

              <div className="grid gap-3">
                {categories.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">Категорий нет</p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setView('category-products');
                      }}
                      className="p-4 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-400 transition"
                    >
                      <h3 className="font-semibold text-slate-900">{cat.name}</h3>
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

  if (view === 'manage-access') {
    return <ManageAccessView userRole={userRole} onBack={() => setView('list')} />;
  }

  if (view === 'add-category') {
    return <AddCategoryForm onBack={() => setView('list')} onSuccess={() => { loadData(); setView('list'); }} />;
  }

  if (view === 'category-products' && selectedCategory) {
    const categoryProducts = products.filter(p => p.category_id === selectedCategory.id);
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => { setView('list'); setSelectedCategory(null); }} className="flex items-center gap-2 text-slate-600 transition">
              <ArrowLeft className="w-5 h-5" /> Назад
            </button>
            <h1 className="text-xl font-bold">{selectedCategory.name}</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button onClick={() => setView('add-product')} className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Добавить товар
          </button>
          {categoryProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Товаров нет</p>
          ) : (
            categoryProducts.map((p) => (
              <ProductCard key={p.id} product={p} onToggle={(active) => adminToggleProductActivity(p.id, active).then(loadData)} />
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'add-product' && selectedCategory) {
    return (
      <AddProductForm 
        categoryId={selectedCategory.id} 
        categoryName={selectedCategory.name} 
        onBack={() => setView('category-products')} 
        onSuccess={() => { loadData(); setView('category-products'); }} 
      />
    );
  }

  return null;
}

/* ---------- УПРАВЛЕНИЕ ДОСТУПОМ ---------- */

function ManageAccessView({ userRole, onBack }: { userRole: AdminRole | null, onBack: () => void }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAdmins(); }, []);

  const loadAdmins = async () => {
    const data = await fetchAllAdmins();
    setAdmins(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) return alert('Заполните ID и Имя');
    
    setLoading(true);
    const { error } = await addAdminUser(parseInt(newId), newName, newRole);
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setNewId('');
      setNewName('');
      loadAdmins();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (id === 732402669) return alert('Нельзя удалить суперадмина');
    if (window.confirm('Отозвать доступ?')) {
      await removeAdminUser(id);
      loadAdmins();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Доступ</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm space-y-4 border border-slate-100">
          <h2 className="font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" /> Назначить права</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="number" placeholder="Telegram ID" value={newId} onChange={e => setNewId(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            <input type="text" placeholder="Имя сотрудника" value={newName} onChange={e => setNewName(e.target.value)} className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <select value={newRole} onChange={e => setNewRole(e.target.value as AdminRole)} className="w-full p-2 border rounded-lg bg-white">
            <option value="admin">Администратор (Товары и заказы)</option>
            {userRole === 'superadmin' && <option value="owner">Владелец (Может добавлять админов)</option>}
          </select>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Добавление...' : 'Дать доступ'}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="font-bold text-slate-700 px-1">Список персонала</h2>
          {admins.map(admin => (
            <div key={admin.telegram_id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-slate-100">
              <div>
                <p className="font-bold">{admin.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    admin.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                    admin.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {admin.role}
                  </span>
                  <span className="text-xs text-slate-400">ID: {admin.telegram_id}</span>
                </div>
              </div>
              {admin.role !== 'superadmin' && (
                <button onClick={() => handleDelete(admin.telegram_id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---------- */

function AddCategoryForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await adminCreateCategory(name);
    if (result.success) onSuccess();
    else alert('Ошибка при создании');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 mb-6"><ArrowLeft className="w-5 h-5" /> Назад</button>
        <h1 className="text-3xl font-bold mb-6">Новая категория</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Название (например: Напитки)" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-slate-900" required />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddProductForm({ categoryId, categoryName, onBack, onSuccess }: { categoryId: string; categoryName: string; onBack: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let url = null;
    if (image) {
      const res = await adminUploadImage(image);
      url = res.url || null;
    }
    const res = await adminCreateProduct(categoryId, name, parseFloat(price) * 100, desc, url);
    if (res.success) onSuccess();
    else alert('Ошибка при создании товара');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 mb-6"><ArrowLeft className="w-5 h-5" /> Назад</button>
        <h1 className="text-3xl font-bold">{name || 'Новый товар'}</h1>
        <p className="text-slate-500 mb-6">В категорию: {categoryName}</p>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <input type="text" placeholder="Название" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <textarea placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} />
          <input type="number" step="0.01" placeholder="Цена ($)" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <div className="border-2 border-dashed p-4 rounded-lg text-center border-slate-300">
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">
            {loading ? 'Создание...' : 'Создать товар'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductCard({ product, onToggle }: { product: Product; onToggle: (active: boolean) => void }) {
  const active = product.is_active !== false;
  return (
    <div className={`p-4 bg-white rounded-xl border flex justify-between items-center transition shadow-sm ${!active ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex gap-4 items-center">
        {product.image_url ? (
          <img src={product.image_url} className="w-12 h-12 object-cover rounded-lg" alt="" />
        ) : (
          <div className="w-12 h-12 bg-slate-100 rounded-lg" />
        )}
        <div>
          <h4 className="font-bold text-slate-900">{product.name}</h4>
          <p className="text-sm font-bold text-slate-600">${(product.price / 100).toFixed(2)}</p>
        </div>
      </div>
      <button 
        onClick={() => onToggle(!active)}
        className={`p-2 rounded-lg transition ${active ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}
      >
        <ToggleRight className="w-6 h-6" />
      </button>
    </div>
  );
}