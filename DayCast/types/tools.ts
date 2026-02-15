/**
 * 外部ツール（API連携）の型定義
 */

// 天気情報
export type WeatherData = {
  location: string;
  temperature: number;      // 気温（℃）
  condition: string;        // 天気（晴れ、曇り、雨など）
  humidity: number;         // 湿度（%）
  windSpeed: number;        // 風速（m/s）
  forecast?: {              // 予報（オプション）
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
  content: string;          // 抽出したテキスト
  metadata?: {              // メタデータ
    author?: string;
    publishedAt?: Date;
    tags?: string[];
  };
  scrapedAt: Date;
};

// ツール実行結果の共通型
export type ToolResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
