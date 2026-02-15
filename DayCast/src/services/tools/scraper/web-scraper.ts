/**
 * Web Scraper 実装
 * class禁止: ファクトリ関数パターン
 */

import type { IScraper, ScrapeOptions, ScrapeMetadata } from '@/types/provider';
import type { ScrapedData, ToolResult } from '@/types/tools';
import * as cheerio from 'cheerio';

export class ScraperError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ScraperError';
  }
}

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '192.168.'];

const isBlockedUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return BLOCKED_HOSTS.some(h => parsed.hostname.startsWith(h) || parsed.hostname === h);
  } catch {
    return true;
  }
};

export const createWebScraper = (): IScraper => {
  const scrape = async (options: ScrapeOptions): Promise<ToolResult<ScrapedData>> => {
    if (isBlockedUrl(options.url)) {
      return { success: false, error: 'ブロックされたURLです（ローカルアドレスは許可されていません）' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

      const response = await fetch(options.url, {
        signal: controller.signal,
        headers: { 'User-Agent': options.userAgent || 'YOPPYBot/1.0' },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return { success: false, error: `HTTP error: ${response.status}` };
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // スクリプト・スタイル・ナビ等を除去
      if (options.removeScripts !== false) $('script').remove();
      if (options.removeStyles !== false) $('style').remove();
      $('nav, header, footer, aside, .sidebar, .nav, .menu').remove();

      // コンテンツ抽出
      let content = '';
      if (options.selector) {
        content = $(options.selector).text().trim();
      } else {
        const mainSelectors = ['article', 'main', '[role="main"]', '.post-content', '.entry-content', '.content'];
        for (const sel of mainSelectors) {
          const found = $(sel).text().trim();
          if (found.length > 100) { content = found; break; }
        }
        if (!content) content = $('body').text().trim();
      }

      // テキスト整形
      content = content.replace(/\s+/g, ' ').trim();
      if (options.maxLength && content.length > options.maxLength) {
        content = content.substring(0, options.maxLength) + '...';
      }

      const title = $('title').text().trim() || undefined;

      return {
        success: true,
        data: {
          url: options.url,
          title,
          content,
          metadata: {
            author: $('meta[name="author"]').attr('content') || undefined,
            publishedAt: undefined,
            tags: undefined,
          },
          scrapedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'スクレイピングに失敗しました',
      };
    }
  };

  const scrapeMultiple = async (urls: string[]): Promise<ToolResult<ScrapedData[]>> => {
    const results = await Promise.allSettled(
      urls.map(url => scrape({ url }))
    );

    const data: ScrapedData[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        data.push(result.value.data);
      }
    }

    return { success: true, data };
  };

  const getMetadata = async (url: string): Promise<ToolResult<ScrapeMetadata>> => {
    if (isBlockedUrl(url)) {
      return { success: false, error: 'ブロックされたURLです' };
    }

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'YOPPYBot/1.0' },
      });
      if (!response.ok) return { success: false, error: `HTTP error: ${response.status}` };

      const html = await response.text();
      const $ = cheerio.load(html);

      return {
        success: true,
        data: {
          title: $('meta[property="og:title"]').attr('content') || $('title').text().trim() || undefined,
          description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || undefined,
          author: $('meta[name="author"]').attr('content') || undefined,
          image: $('meta[property="og:image"]').attr('content') || undefined,
          publishedAt: $('meta[property="article:published_time"]').attr('content') || undefined,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'メタデータ取得に失敗しました' };
    }
  };

  return { scrape, scrapeMultiple, getMetadata };
};
