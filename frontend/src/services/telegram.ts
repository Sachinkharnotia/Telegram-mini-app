declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export const getTelegramData = () => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    return {
      initData: webApp.initData,
      initDataUnsafe: webApp.initDataUnsafe,
      themeParams: webApp.themeParams,
      isExpanded: webApp.isExpanded,
      viewportHeight: webApp.viewportHeight,
      viewportStableHeight: webApp.viewportStableHeight,
      colorScheme: webApp.colorScheme,
    };
  }
  return null;
};

export const expandTelegramApp = () => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.expand();
  }
};

export const setTelegramHeaderColor = (color: string) => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.setHeaderColor(color);
  }
};
