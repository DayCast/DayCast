/**
 * Webスクレイパー実装
 * cheerioを使用してHTMLを解析
 */

import * as cheerio from 'cheerio';
import type { ScrapedData } from '@/types';
import type { IScraper, ScrapeOptions, ScraperError } from './base';

/**
 * デフォルトのUser-Agent
 */
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; YOPPYBot/1.0; +https://yoppy.ai)';

/**
 * Web スクレイパー
 */
export class WebScraper implements IScraper {
  private defaultTimeout: number;
  private defaultMaxLength: number;

  constructor() {
    this.defaultTimeout = 10000;  // 10秒
    this.defaultMaxLength = 10000; // 10,000文字
  }

  /**
   * URLからコンテンツを取得
   */
  async scrape(options: ScrapeOptions): Promise<ScrapedData> {
    try {
      // URLのバリデーション
      this.validateUrl(options.url);

      // robots.txtをチェック（オプション）
      // 本番環境では実装を推奨
      // const robotsAllowed = await this.checkRobots(options.url);
      // if (!robotsAllowed) {
      //   throw new Error('Scraping not allowed by robots.txt');
      // }

      // コンテンツを取得
      const html = await this.fetchContent(options);

      // HTMLを解析
      const $ = cheerio.load(html);

      // スクリプトとスタイルを削除
      if (options.removeScripts !== false) {
        $('script').remove();
        $('noscript').remove();
      }
      
      if (options.removeStyles !== false) {
        $('style').remove();
      }

      // 不要な要素を削除
      $('nav').remove();
      $('header').remove();
      $('footer').remove();
      $('.advertisement').remove();
      $('.ad').remove();
      $('.sidebar').remove();

      // コンテンツを抽出
      let content = '';
      
      if (options.selector) {
        // 指定されたセレクタの要素を抽出
        content = $(options.selector).text();
      } else {
        // 記事コンテンツを推測して抽出
        content = this.extractMainContent($);
      }

      // テキストをクリーンアップ
      content = this.cleanText(content);

      // 最大文字数で切り詰め
      const maxLength = options.maxLength || this.defaultMaxLength;
      if (content.length > maxLength) {
        content = content.substring(0, maxLength) + '...';
      }

      // メタデータを抽出
      const metadata = this.extractMetadata($);

      return {
        url: options.url,
        title: metadata.title,
        content,
        metadata: {
          author: metadata.author,
          publishedAt: metadata.publishedAt,
          tags: metadata.tags,
        },
        scrapedAt: new Date(),
      };
    } catch (error) {
      throw this.handleError(error, options.url);
    }
  }

  /**
   * 複数のURLからコンテンツを取得
   */
  async scrapeMultiple(urls: string[]): Promise<ScrapedData[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.scrape({ url }))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<ScrapedData> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * メタデータのみを取得
   */
  async getMetadata(url: string): Promise<{
    title?: string;
    description?: string;
    author?: string;
    publishedAt?: Date;
    image?: string;
  }> {
    try {
      this.validateUrl(url);
      const html = await this.fetchContent({ url });
      const $ = cheerio.load(html);
      return this.extractMetadata($);
    } catch (error) {
      throw this.handleError(error, url);
    }
  }

  /**
   * コンテンツをフェッチ
   */
  private async fetchContent(options: ScrapeOptions): Promise<string> {
    const timeout = options.timeout || this.defaultTimeout;
    const userAgent = options.userAgent || DEFAULT_USER_AGENT;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(options.url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * メインコンテンツを抽出
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // 一般的な記事要素を試す
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '#content',
      '.post',
      '.article',
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text();
        if (text.length > 100) {  // 100文字以上ある場合のみ採用
          return text;
        }
      }
    }

    // 見つからない場合はbody全体を返す
    return $('body').text();
  }

  /**
   * メタデータを抽出
   */
  private extractMetadata($: cheerio.CheerioAPI): {
    title?: string;
    description?: string;
    author?: string;
    publishedAt?: Date;
    image?: string;
    tags?: string[];
  } {
    // タイトル
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text();

    // 説明
    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content');

    // 著者
    const author = 
      $('meta[property="article:author"]').attr('content') ||
      $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').text();

    // 公開日
    let publishedAt: Date | undefined;
    const publishedStr = 
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="publish-date"]').attr('content') ||
      $('time[datetime]').attr('datetime');
    
    if (publishedStr) {
      const date = new Date(publishedStr);
      if (!isNaN(date.getTime())) {
        publishedAt = date;
      }
    }

    // 画像
    const image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    // タグ/キーワード
    const tagsStr = 
      $('meta[property="article:tag"]').attr('content') ||
      $('meta[name="keywords"]').attr('content');
    
    const tags = tagsStr 
      ? tagsStr.split(/[,、]/).map(t => t.trim()).filter(Boolean)
      : undefined;

    return {
      title: this.cleanText(title || ''),
      description: description ? this.cleanText(description) : undefined,
      author: author ? this.cleanText(author) : undefined,
      publishedAt,
      image,
      tags,
    };
  }

  /**
   * テキストをクリーンアップ
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // 連続する空白を1つに
      .replace(/\n\s*\n/g, '\n')      // 連続する改行を1つに
      .trim();
  }

  /**
   * URLのバリデーション
   */
  private validateUrl(url: string): void {
    try {
      const parsed = new URL(url);
      
      // HTTPとHTTPSのみ許可
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${parsed.protocol}`);
      }

      // localhostへのアクセスを禁止（セキュリティ）
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        throw new Error('Localhost access is not allowed');
      }

      // プライベートIPアドレスを禁止
      if (this.isPrivateIP(parsed.hostname)) {
        throw new Error('Private IP address access is not allowed');
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Invalid URL: ${url}`);
      }
      throw error;
    }
  }

  /**
   * プライベートIPアドレスかチェック
   */
  private isPrivateIP(hostname: string): boolean {
    // IPv4プライベートアドレス範囲
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
    ];

    return privateRanges.some(range => range.test(hostname));
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any, url?: string): ScraperError {
    const message = error?.message || 'Unknown scraping error';
    
    // タイムアウトエラー
    if (message.includes('aborted') || message.includes('timeout')) {
      return {
        name: 'ScraperError',
        message: 'Request timed out',
        url,
        originalError: error,
      } as ScraperError;
    }

    // ネットワークエラー
    if (message.includes('fetch') || message.includes('network')) {
      return {
        name: 'ScraperError',
        message: 'Network error. Could not connect to the URL.',
        url,
        originalError: error,
      } as ScraperError;
    }

    // HTTPエラー
    if (message.includes('HTTP')) {
      return {
        name: 'ScraperError',
        message: `Failed to fetch content: ${message}`,
        url,
        originalError: error,
      } as ScraperError;
    }

    // その他のエラー
    return {
      name: 'ScraperError',
      message: `Scraping error: ${message}`,
      url,
      originalError: error,
    } as ScraperError;
  }
}
