/**
 * ユーザー関連の型定義
 */

import type { AuthProvider } from './auth';

// ユーザーの基本情報
export type User = {
  id: string;                    // 内部ID（cuid）
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: Date;          // メール認証済み日時
  primaryProvider: AuthProvider; // メイン認証方法
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
  aiAutoMode: boolean;           // AIが自動でタスクを実行するか
  updatedAt: Date;
};
