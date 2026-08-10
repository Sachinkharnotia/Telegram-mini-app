export interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openLink: (url: string) => void;
  initData: string;
  initDataUnsafe?: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export const getTelegramWebApp = (): TelegramWebApp | undefined => {
  return window.Telegram?.WebApp;
};

export const isTelegramEnvironment = (): boolean => {
  const tg = getTelegramWebApp();
  return !!tg && !!tg.initData;
};

export const getStartParam = (): string | null => {
  const tg = getTelegramWebApp();
  if (tg?.initDataUnsafe?.start_param) {
    return tg.initDataUnsafe.start_param;
  }
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tgWebAppStartParam') || urlParams.get('startapp') || urlParams.get('ref');
};

export const getTelegramDeepLink = (startParam: string = 'home'): string => {
  const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_NAME as string) || 'VaultYieldBot';
  const appShortName = (import.meta.env.VITE_TELEGRAM_APP_NAME as string) || 'app';
  return `https://t.me/${botUsername}/${appShortName}?startapp=${encodeURIComponent(startParam)}`;
};

export const openExternalLink = (url: string) => {
  const tg = getTelegramWebApp();
  if (tg && isTelegramEnvironment()) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) {
      tg.setHeaderColor('#0c0914');
    }
  }
};
