/**
 * アプリ全体の設定
 */

// アプリ情報
export const APP_INFO = {
  NAME: 'YOPPY AI Todo Manager',
  VERSION: '1.0.0',
  DESCRIPTION: 'AIエージェントがタスク管理を支援するアプリ',
} as const;

// 日時フォーマット
export const DATE_FORMATS = {
  FULL: 'YYYY年MM月DD日 HH:mm',
  DATE: 'YYYY年MM月DD日',
  TIME: 'HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// デフォルト設定
export const DEFAULT_SETTINGS = {
  TIMEZONE: 'Asia/Tokyo',
  LOCALE: 'ja-JP',
  THEME: 'light',
} as const;

// 外部サービスURL
export const EXTERNAL_URLS = {
  GOOGLE_CALENDAR: 'https://calendar.google.com',
  GEMINI_API: 'https://generativelanguage.googleapis.com',
} as const;
