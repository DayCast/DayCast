/**
 * ユーザー関連の型定義
 */

import type { AuthProvider } from './auth';

// ユーザーの基本情報
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: Date;
  primaryProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
};

// ユーザー設定
export type UserSettings = {
  id: string;
  userId: string;

  // 連携状態
  googleConnected: boolean;
  googleCalendarId?: string;
  githubConnected: boolean;
  appleConnected: boolean;
  twitterConnected: boolean;

  // アプリ設定
  timezone: string;
  location?: string;
  enableNotifications: boolean;
  aiAutoMode: boolean;
  updatedAt: Date;
};
