/**
 * カレンダープロバイダーの共通インターフェース
 */

import type { CalendarEvent } from '@/types';

/**
 * カレンダープロバイダーの種類
 */
export type CalendarProviderType = 'google';

/**
 * カレンダープロバイダーの設定
 */
export interface CalendarProviderConfig {
  type: CalendarProviderType;
  accessToken: string;       // OAuthアクセストークン
  refreshToken?: string;     // リフレッシュトークン
  calendarId?: string;       // カレンダーID（デフォルト: 'primary'）
}

/**
 * イベント作成オプション
 */
export interface CreateEventOptions {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  attendees?: string[];      // メールアドレスのリスト
  reminders?: {              // リマインダー設定
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

/**
 * イベント更新オプション
 */
export interface UpdateEventOptions {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}

/**
 * イベント検索オプション
 */
export interface SearchEventsOptions {
  startDate: Date;
  endDate: Date;
  query?: string;            // キーワード検索
  maxResults?: number;       // 最大取得件数
}

/**
 * カレンダープロバイダーの基底インターフェース
 */
export interface ICalendarProvider {
  /**
   * プロバイダー名
   */
  readonly name: CalendarProviderType;

  /**
   * イベント一覧を取得
   */
  getEvents(
    startDate: Date,
    endDate: Date,
    maxResults?: number
  ): Promise<CalendarEvent[]>;

  /**
   * イベントを作成
   */
  createEvent(options: CreateEventOptions): Promise<CalendarEvent>;

  /**
   * イベントを更新
   */
  updateEvent(
    eventId: string,
    options: UpdateEventOptions
  ): Promise<CalendarEvent>;

  /**
   * イベントを削除
   */
  deleteEvent(eventId: string): Promise<void>;

  /**
   * イベントを検索
   */
  searchEvents(options: SearchEventsOptions): Promise<CalendarEvent[]>;

  /**
   * 空き時間を検索
   */
  findFreeTime(
    startDate: Date,
    endDate: Date,
    durationMinutes: number
  ): Promise<Array<{ start: Date; end: Date }>>;

  /**
   * 接続テスト
   */
  testConnection(): Promise<boolean>;
}

/**
 * カレンダープロバイダーエラー
 */
export class CalendarProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: CalendarProviderType,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CalendarProviderError';
  }
}
