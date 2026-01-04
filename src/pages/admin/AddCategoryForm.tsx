import { useState } from 'react';
import { adminCreateCategory } from '../../lib/db';
import { ArrowLeft } from 'lucide-react';

interface AddCategoryFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AddCategoryForm({ onBack, onSuccess }: AddCategoryFormProps) {
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
