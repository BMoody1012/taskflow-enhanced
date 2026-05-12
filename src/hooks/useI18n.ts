
import { translations } from '../translations';
import { Language } from '../types';

export function useI18n(lang: Language) {
  const t = translations[lang] || translations.en;
  return { t, isRtl: lang === 'ar' };
}
