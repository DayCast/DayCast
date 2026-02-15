/**
 * 外部ツール（API連携）の型定義
 */

// 天気情報
export type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast?: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
  fetchedAt: Date;
};

// カレンダーイベント
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
};

// スクレイピング結果
export type ScrapedData = {
  url: string;
  title?: string;
  content: string;
  metadata?: {
    author?: string;
    publishedAt?: Date;
    tags?: string[];
  };
  scrapedAt: Date;
};

// ツール実行結果の共通型
export type ToolResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
