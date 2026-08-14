import { create } from 'zustand';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ru';

export interface Translations {
  appName: string;
  navHome: string;
  navCalc: string;
  navHistory: string;
  navRef: string;
  navProfile: string;
  deposit: string;
  withdraw: string;
  claimYield: string;
  claiming: string;
  buyVx: string;
  vxBalance: string;
  usdtBalance: string;
  miningActive: string;
  holdToMine: string;
  calculator: string;
  historyTitle: string;
  referralTitle: string;
  profileTitle: string;
  theme: string;
  language: string;
  notifications: string;
  privacy: string;
  faq: string;
  support: string;
  authenticator: string;
  verified: string;
  copyRefLink: string;
  shareRefLink: string;
}

const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: 'VextoralMining',
    navHome: 'Dashboard',
    navCalc: 'Calculator',
    navHistory: 'History',
    navRef: 'Referrals',
    navProfile: 'Profile',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    claimYield: 'Claim Yield',
    claiming: 'Claiming...',
    buyVx: 'Buy VX',
    vxBalance: 'VX Token Balance',
    usdtBalance: 'USDT Balance',
    miningActive: 'VX Mining Active',
    holdToMine: 'Hold 100+ VX to Mine',
    calculator: 'VX Yield Calculator',
    historyTitle: 'Financial Stream Ledger',
    referralTitle: 'Ambassador Referral Program',
    profileTitle: 'Account Profile',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Notifications',
    privacy: 'Privacy Policy',
    faq: 'FAQ',
    support: 'Support Desk',
    authenticator: 'Authenticator',
    verified: 'Verified',
    copyRefLink: 'Copy Referral Link',
    shareRefLink: 'Share Referral Link'
  },
  es: {
    appName: 'VextoralMining',
    navHome: 'Panel Principal',
    navCalc: 'Calculadora',
    navHistory: 'Historial',
    navRef: 'Referidos',
    navProfile: 'Perfil',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    claimYield: 'Reclamar Rendimiento',
    claiming: 'Reclamando...',
    buyVx: 'Comprar VX',
    vxBalance: 'Balance Token VX',
    usdtBalance: 'Balance USDT',
    miningActive: 'Minería VX Activa',
    holdToMine: 'Maneje 100+ VX para Minar',
    calculator: 'Calculadora de Rendimiento VX',
    historyTitle: 'Registro Financiero',
    referralTitle: 'Programa de Referidos',
    profileTitle: 'Perfil de Cuenta',
    theme: 'Tema',
    language: 'Idioma',
    notifications: 'Notificaciones',
    privacy: 'Política de Privacidad',
    faq: 'Preguntas Frecuentes',
    support: 'Soporte 24/7',
    authenticator: 'Autenticador',
    verified: 'Verificado',
    copyRefLink: 'Copiar Enlace',
    shareRefLink: 'Compartir Enlace'
  },
  fr: {
    appName: 'VextoralMining',
    navHome: 'Tableau de bord',
    navCalc: 'Calculateur',
    navHistory: 'Historique',
    navRef: 'Parrainage',
    navProfile: 'Profil',
    deposit: 'Dépôt',
    withdraw: 'Retrait',
    claimYield: 'Réclamer le rendement',
    claiming: 'Reclamation...',
    buyVx: 'Acheter VX',
    vxBalance: 'Solde de jetons VX',
    usdtBalance: 'Solde USDT',
    miningActive: 'Minage VX Actif',
    holdToMine: 'Détenir 100+ VX pour miner',
    calculator: 'Calculateur de rendement VX',
    historyTitle: 'Registre des transactions',
    referralTitle: 'Programme de parrainage',
    profileTitle: 'Profil du compte',
    theme: 'Thème',
    language: 'Langue',
    notifications: 'Notifications',
    privacy: 'Politique de confidentialité',
    faq: 'Foire aux questions',
    support: 'Support 24/7',
    authenticator: 'Authentificateur',
    verified: 'Vérifié',
    copyRefLink: 'Copier le lien',
    shareRefLink: 'Partager le lien'
  },
  de: {
    appName: 'VextoralMining',
    navHome: 'Dashboard',
    navCalc: 'Rechner',
    navHistory: 'Verlauf',
    navRef: 'Empfehlungen',
    navProfile: 'Profil',
    deposit: 'Einzahlung',
    withdraw: 'Auszahlung',
    claimYield: 'Ertrag beanspruchen',
    claiming: 'Wird beansprucht...',
    buyVx: 'VX Kaufen',
    vxBalance: 'VX Token Guthaben',
    usdtBalance: 'USDT Guthaben',
    miningActive: 'VX Mining Aktiv',
    holdToMine: 'Mind. 100 VX halten',
    calculator: 'VX Ertragsrechner',
    historyTitle: 'Finanzbuch',
    referralTitle: 'Empfehlungsprogramm',
    profileTitle: 'Konto-Profil',
    theme: 'Design',
    language: 'Sprache',
    notifications: 'Benachrichtigungen',
    privacy: 'Datenschutzrichtlinie',
    faq: 'Häufig gestellte Fragen',
    support: 'Kundendienst',
    authenticator: 'Authentifikator',
    verified: 'Verifiziert',
    copyRefLink: 'Link kopieren',
    shareRefLink: 'Link teilen'
  },
  ru: {
    appName: 'VextoralMining',
    navHome: 'Главная',
    navCalc: 'Калькулятор',
    navHistory: 'История',
    navRef: 'Рефералы',
    navProfile: 'Профиль',
    deposit: 'Пополнить',
    withdraw: 'Вывести',
    claimYield: 'Собрать доход',
    claiming: 'Сбор...',
    buyVx: 'Купить VX',
    vxBalance: 'Баланс токенов VX',
    usdtBalance: 'Баланс USDT',
    miningActive: 'VX Майнинг Активен',
    holdToMine: 'Держите от 100 VX для майнинга',
    calculator: 'Калькулятор доходности VX',
    historyTitle: 'История транзакций',
    referralTitle: 'Реферальная программа',
    profileTitle: 'Профиль аккаунта',
    theme: 'Тема',
    language: 'Язык',
    notifications: 'Уведомления',
    privacy: 'Политика конфиденциальности',
    faq: 'Часто задаваемые вопросы',
    support: 'Служба поддержки',
    authenticator: 'Аутентификатор',
    verified: 'Подтвержден',
    copyRefLink: 'Скопировать ссылку',
    shareRefLink: 'Поделиться ссылкой'
  }
};

interface I18nState {
  language: LanguageCode;
  t: Translations;
  setLanguage: (lang: LanguageCode) => void;
}

const initialLang = (localStorage.getItem('app_lang') as LanguageCode) || 'en';

export const useI18nStore = create<I18nState>((set) => ({
  language: initialLang,
  t: translations[initialLang] || translations.en,
  setLanguage: (lang) => {
    localStorage.setItem('app_lang', lang);
    set({ language: lang, t: translations[lang] || translations.en });
  }
}));
