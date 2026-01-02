const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function notifyUserOrderAccepted(
  telegramUserId: number,
  orderId: string
) {
  try {
    const res = await fetch(
      'https://cluwvupuextcpxcoouba.supabase.co/functions/v1/send-telegram-notification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ telegramUserId, orderId }),
      }
    );

    const text = await res.text();
    console.log('📡 Edge Function response:', text);
  } catch (err) {
    console.error('Telegram notification failed', err);
  }
}
