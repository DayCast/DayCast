/**
 * 認証関連の型定義
 */

// サポートする認証プロバイダー
export type AuthProvider =
  | 'google'      // Google OAuth
  | 'github'      // GitHub OAuth
  | 'apple'       // Apple Sign In
  | 'twitter'     // X (旧Twitter)
  | 'microsoft'   // Microsoft/Azure AD
  | 'email';      // メール/パスワード

// OAuth連携アカウント
export type OAuthAccount = {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
  idToken?: string;
  createdAt: Date;
  updatedAt: Date;
};

// ログインセッション情報
export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    primaryProvider: AuthProvider;
  };
  expiresAt: Date;
};

// サインアップ入力（メール/パスワード）
export type SignUpInput = {
  email: string;
  password: string;
  name: string;
};

// OAuth認証レスポンス（共通）
export type OAuthUserInfo = {
  provider: AuthProvider;
  providerAccountId: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  idToken?: string;
};
