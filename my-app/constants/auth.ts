// constants/auth.ts
/**
 * 認証関連の定数
 */

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  APPLE: 'apple',
  TWITTER: 'twitter',
  MICROSOFT: 'microsoft',
  EMAIL: 'email',
} as const;

// プロバイダーごとの表示情報
export const PROVIDER_INFO = {
  google: {
    name: 'Google',
    icon: '🔵',
    color: '#4285F4',
    features: ['カレンダー連携', 'Gmail連携'],
  },
  github: {
    name: 'GitHub',
    icon: '⚫',
    color: '#181717',
    features: ['Issue管理', 'PR通知'],
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: '#000000',
    features: ['プライバシー重視'],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '🐦',
    color: '#1DA1F2',
    features: ['ツイート投稿'],
  },
  microsoft: {
    name: 'Microsoft',
    icon: '🪟',
    color: '#00A4EF',
    features: ['Outlook連携', 'Teams連携'],
  },
  email: {
    name: 'メール',
    icon: '📧',
    color: '#6B7280',
    features: ['パスワード管理'],
  },
} as const;

// OAuth設定
export const OAUTH_CONFIG = {
  // リダイレクトURI
  REDIRECT_URI: '/api/auth/callback',
  
  // セッション有効期限（日数）
  SESSION_DURATION_DAYS: 30,
  
  // トークンリフレッシュのタイミング（期限の何分前）
  TOKEN_REFRESH_BEFORE_MINUTES: 5,
} as const;

// OAuth Scope（各サービスで必要な権限）
export const OAUTH_SCOPES = {
  google: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
  ],
  github: [
    'read:user',
    'user:email',
    'repo',  // リポジトリアクセス（必要に応じて）
  ],
  apple: [
    'name',
    'email',
  ],
  twitter: [
    'tweet.read',
    'tweet.write',
    'users.read',
  ],
  microsoft: [
    'openid',
    'email',
    'profile',
    'Calendars.ReadWrite',
  ],
} as const;