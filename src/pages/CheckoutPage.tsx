import { useState } from 'react';
import { CartItem } from '../lib/db';
import { ArrowLeft } from 'lucide-react';

export type DeliveryType = 'pickup' | 'courier' | 'post';

export interface CheckoutData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  deliveryType: DeliveryType;
}

interface CheckoutPageProps {
  items: CartItem[];
  onBack: () => void;
  onConfirm: (data: CheckoutData) => void;
  loading?: boolean;
}

export function CheckoutPage({
  items,
  onBack,
  onConfirm,
  loading = false,
}: CheckoutPageProps) {
  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>('pickup');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const needsAddress = deliveryType !== 'pickup';

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Введите имя');
      return;
    }

    if (!phone.trim()) {
      alert('Введите телефон');
      return;
    }

    if (needsAddress && !address.trim()) {
      alert('Введите адрес доставки');
      return;
    }

    onConfirm({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: needsAddress ? address.trim() : undefined,
      notes: notes.trim() || undefined,
      deliveryType,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            Оформление заказа
          </h1>
        </div>

        {/* Delivery type */}
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <p className="font-semibold">Способ получения</p>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={deliveryType === 'pickup'}
              onChange={() => setDeliveryType('pickup')}
            />
            🏪 Самовывоз
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={deliveryType === 'courier'}
              onChange={() => setDeliveryType('courier')}
            />
            🚚 Курьер
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={deliveryType === 'post'}
              onChange={() => setDeliveryType('post')}
            />
            📦 Почта
          </label>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-xl p-4 shadow space-y-4">
          <p className="font-semibold">Контактные данные</p>

          <input
            className="w-full border rounded-lg p-2"
            placeholder="Имя *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-2"
            placeholder="Телефон *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-2"
            placeholder="Email (необязательно)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {needsAddress && (
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Адрес доставки *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}

          <textarea
            className="w-full border rounded-lg p-2"
            placeholder="Комментарий к заказу"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow space-y-3">
          <div className="flex justify-between font-semibold">
            <span>Итого</span>
            <span>{(total / 100).toFixed(2)} €</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? 'Оформляем…' : 'Подтвердить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
}
