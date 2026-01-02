import { CheckCircle } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  onNewOrder: () => void;
}

export function OrderConfirmation({
  orderId,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Спасибо!
        </h1>

        <p className="text-slate-600 mb-2">
          Ваш заказ принят
        </p>

        <p className="text-sm text-slate-500 mb-6">
          Номер заказа: {orderId}
        </p>

        <button
          onClick={onNewOrder}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Продолжить покупки
        </button>
      </div>
    </div>
  );
}
