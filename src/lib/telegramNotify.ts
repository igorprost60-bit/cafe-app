export async function notifyUserOrderAccepted(
  telegramUserId: number,
  orderId: string
) {
  await fetch(
    'https://cluwvupuextcpxcoouba.supabase.co/functions/v1/send-telegram-notification',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telegramUserId, orderId }),
    }
  );
}
