/**
 * スクレイパーの共通インターフェース
 */

import type { ScrapedData } from '@/types';

/**
 * スクレイピングオプション
 */
export interface ScrapeOptions {
  url: string;
  selector?: string;        // CSSセレクタ（特定の要素を抽出）
  removeScripts?: boolean;  // scriptタグを削除（デフォルト: true）
  removeStyles?: boolean;   // styleタグを削除（デフォルト: true）
  maxLength?: number;       // 最大文字数（デフォルト: 10000）
  timeout?: number;         // タイムアウト（ミリ秒、デフォルト: 10000）
  userAgent?: string;       // User-Agent
}

/**
 * スクレイパーの基底インターフェース
 */
export interface IScraper {
  /**
   * URLからコンテンツを取得
   */
  scrape(options: ScrapeOptions): Promise<ScrapedData>;

  /**
   * 複数のURLからコンテンツを取得
   */
  scrapeMultiple(urls: string[]): Promise<ScrapedData[]>;

  /**
   * メタデータのみを取得（タイトル、説明など）
   */
  getMetadata(url: string): Promise<{
    title?: string;
    description?: string;
    author?: string;
    publishedAt?: Date;
    image?: string;
  }>;
}

/**
 * スクレイパーエラー
 */
export class ScraperError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}

/**
 * コンテンツタイプ
 */
export type ContentType = 'html' | 'json' | 'text' | 'xml' | 'unknown';

/**
 * ロボットポリシー
 */
export interface RobotsPolicy {
  allowed: boolean;
  crawlDelay?: number;  // 秒数
}
