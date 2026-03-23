import en from './en.json';
import es from './es.json';

export type Lang = 'en' | 'es';

const translations: Record<Lang, Record<string, string>> = { en, es };

export function t(key: string, lang: Lang): string {
  return translations[lang]?.[key] ?? translations['en'][key] ?? key;
}

export function getLangFromPath(pathname: string): Lang {
  if (pathname.startsWith('/es')) return 'es';
  return 'en';
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === 'en' ? 'es' : 'en';
}

export const SUPPORTED_LANGS: Lang[] = ['en', 'es'];
