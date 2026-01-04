import { useState } from 'react';
import { adminCreateProduct, adminUploadImage } from '../../lib/db';
import { ArrowLeft, Upload, ToggleRight } from 'lucide-react';

interface AddProductFormProps {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function AddProductForm({
  categoryId,
  categoryName,
  onBack,
  onSuccess,
}: AddProductFormProps) {
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
