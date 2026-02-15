// types/user.ts - 修正版
/**
 * ユーザー関連の型定義
 */

import type { AuthProvider } from './auth';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: Date;          // メール認証済み日時
  primaryProvider: AuthProvider; // メイン認証方法
  createdAt: Date;
  updatedAt: Date;
};

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