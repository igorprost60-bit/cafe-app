import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;

    if (!tg) {
      console.log('❌ Not in Telegram');
      setIsTelegram(false);
      return;
    }

    tg.ready();

    console.log('✅ Telegram WebApp ready');
    console.log('initData:', tg.initData);
    console.log('initDataUnsafe:', tg.initDataUnsafe);

    setIsTelegram(true);
    setUser(tg.initDataUnsafe?.user ?? null);
  }, []);

  return {
    isTelegram,
    user,
  };
}
