import type { OcrLanguage } from '../types/ocr';

export const OCR_LANGUAGES: OcrLanguage[] = [
  // Popular Languages
  { code: 'eng', name: 'English', nativeName: 'English', category: 'Popular', script: 'Latin' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी', category: 'Popular', script: 'Devanagari' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español', category: 'Popular', script: 'Latin' },
  { code: 'fra', name: 'French', nativeName: 'Français', category: 'Popular', script: 'Latin' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch', category: 'Popular', script: 'Latin' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文', category: 'Popular', script: 'Han' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية', category: 'Popular', script: 'Arabic' },

  // South Asian Languages
  { code: 'ben', name: 'Bengali', nativeName: 'বাংলা', category: 'South Asian', script: 'Bengali' },
  { code: 'asm', name: 'Assamese', nativeName: 'অসমীয়া', category: 'South Asian', script: 'Bengali' },
  { code: 'tam', name: 'Tamil', nativeName: 'தமிழ்', category: 'South Asian', script: 'Tamil' },
  { code: 'tel', name: 'Telugu', nativeName: 'తెలుగు', category: 'South Asian', script: 'Telugu' },
  { code: 'mar', name: 'Marathi', nativeName: 'मराठी', category: 'South Asian', script: 'Devanagari' },
  { code: 'guj', name: 'Gujarati', nativeName: 'ગુજરાતી', category: 'South Asian', script: 'Gujarati' },
  { code: 'pan', name: 'Punjabi (Gurmukhi)', nativeName: 'ਪੰਜਾਬੀ', category: 'South Asian', script: 'Gurmukhi' },
  { code: 'kan', name: 'Kannada', nativeName: 'ಕನ್ನಡ', category: 'South Asian', script: 'Kannada' },
  { code: 'mal', name: 'Malayalam', nativeName: 'മലയാളം', category: 'South Asian', script: 'Malayalam' },
  { code: 'urd', name: 'Urdu', nativeName: 'اردو', category: 'South Asian', script: 'Arabic' },
  { code: 'san', name: 'Sanskrit', nativeName: 'संस्कृतम्', category: 'South Asian', script: 'Devanagari' },
  { code: 'nep', name: 'Nepali', nativeName: 'नेपाली', category: 'South Asian', script: 'Devanagari' },

  // East & Southeast Asian
  { code: 'chi_tra', name: 'Chinese (Traditional)', nativeName: '繁體中文', category: 'East Asian', script: 'Han' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語', category: 'East Asian', script: 'Japanese' },
  { code: 'kor', name: 'Korean', nativeName: '한국어', category: 'East Asian', script: 'Hangul' },
  { code: 'vie', name: 'Vietnamese', nativeName: 'Tiếng Việt', category: 'East Asian', script: 'Latin' },
  { code: 'tha', name: 'Thai', nativeName: 'ไทย', category: 'East Asian', script: 'Thai' },

  // European Languages
  { code: 'por', name: 'Portuguese', nativeName: 'Português', category: 'European', script: 'Latin' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano', category: 'European', script: 'Latin' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский', category: 'European', script: 'Cyrillic' },
  { code: 'nld', name: 'Dutch', nativeName: 'Nederlands', category: 'European', script: 'Latin' },
  { code: 'pol', name: 'Polish', nativeName: 'Polski', category: 'European', script: 'Latin' },
  { code: 'swe', name: 'Swedish', nativeName: 'Svenska', category: 'European', script: 'Latin' },
  { code: 'ukr', name: 'Ukrainian', nativeName: 'Українська', category: 'European', script: 'Cyrillic' },
  { code: 'tur', name: 'Turkish', nativeName: 'Türkçe', category: 'European', script: 'Latin' },
  { code: 'ell', name: 'Greek', nativeName: 'Ελληνικά', category: 'European', script: 'Greek' },
  { code: 'heb', name: 'Hebrew', nativeName: 'עברית', category: 'Middle Eastern', script: 'Hebrew' },
  { code: 'fas', name: 'Persian (Farsi)', nativeName: 'فارسی', category: 'Middle Eastern', script: 'Arabic' },
  { code: 'lat', name: 'Latin', nativeName: 'Latina', category: 'Other', script: 'Latin' },
];

export function getLanguageByCode(code: string): OcrLanguage | undefined {
  return OCR_LANGUAGES.find((lang) => lang.code === code);
}

export function searchLanguages(query: string): OcrLanguage[] {
  const q = query.trim().toLowerCase();
  if (!q) return OCR_LANGUAGES;
  return OCR_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      (l.script && l.script.toLowerCase().includes(q))
  );
}
