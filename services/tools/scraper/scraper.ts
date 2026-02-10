/**
 * Webスクレイピングツール
 * AIエージェントから呼び出されるメインインターフェース
 */

import type { ScrapedData, ToolResult } from '@/types';
import { getScraper } from './scraper';

/**
 * Webページをスクレイピング
 */
export async function scrapeWebsite(
  url: string,
  selector?: string
): Promise<ToolResult<ScrapedData>> {
  try {
    const scraper = getScraper();
    const data = await scraper.scrape({ url, selector });
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 複数のWebページをスクレイピング
 */
export async function scrapeMultipleWebsites(
  urls: string[]
): Promise<ToolResult<ScrapedData[]>> {
  try {
    const scraper = getScraper();
    const data = await scraper.scrapeMultiple(urls);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Webページのメタデータのみを取得
 */
export async function getWebsiteMetadata(
  url: string
): Promise<ToolResult<{
  title?: string;
  description?: string;
  author?: string;
  publishedAt?: Date;
  image?: string;
}>> {
  try {
    const scraper = getScraper();
    const data = await scraper.getMetadata(url);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * スクレイピング結果を人間が読みやすい形式でフォーマット
 */
export function formatScrapedData(data: ScrapedData): string {
  let result = '';

  if (data.title) {
    result += `📄 ${data.title}\n\n`;
  }

  if (data.metadata?.author) {
    result += `✍️ 著者: ${data.metadata.author}\n`;
  }

  if (data.metadata?.publishedAt) {
    const dateStr = data.metadata.publishedAt.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    result += `📅 公開日: ${dateStr}\n`;
  }

  if (data.metadata?.tags && data.metadata.tags.length > 0) {
    result += `🏷️ タグ: ${data.metadata.tags.join(', ')}\n`;
  }

  result += `\n📝 内容:\n${data.content}\n`;
  result += `\n🔗 URL: ${data.url}`;

  return result;
}

/**
 * 複数のスクレイピング結果をフォーマット
 */
export function formatMultipleScrapedData(dataList: ScrapedData[]): string {
  if (dataList.length === 0) {
    return 'スクレイピング結果はありません';
  }

  let result = `📚 ${dataList.length}件の記事を取得しました\n\n`;

  dataList.forEach((data, index) => {
    result += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    result += `${index + 1}. ${data.title || 'タイトルなし'}\n\n`;
    
    // 内容の要約（最初の200文字）
    const summary = data.content.length > 200
      ? data.content.substring(0, 200) + '...'
      : data.content;
    
    result += `${summary}\n`;
    result += `🔗 ${data.url}\n`;
  });

  return result;
}

/**
 * URLからドメイン名を抽出
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * スクレイピング可能かURLをチェック
 */
export function isScrapableUrl(url: string): {
  valid: boolean;
  reason?: string;
} {
  try {
    const parsed = new URL(url);
    
    // プロトコルチェック
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        reason: `サポートされていないプロトコルです: ${parsed.protocol}`,
      };
    }

    // ローカルホストチェック
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return {
        valid: false,
        reason: 'localhostへのアクセスは許可されていません',
      };
    }

    // プライベートIPチェック
    if (isPrivateIP(parsed.hostname)) {
      return {
        valid: false,
        reason: 'プライベートIPアドレスへのアクセスは許可されていません',
      };
    }

    // ファイル拡張子チェック（PDFなど）
    const path = parsed.pathname.toLowerCase();
    const nonHtmlExtensions = ['.pdf', '.zip', '.exe', '.dmg', '.jpg', '.png', '.gif'];
    
    if (nonHtmlExtensions.some(ext => path.endsWith(ext))) {
      return {
        valid: false,
        reason: 'HTMLページではありません',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      reason: '無効なURLです',
    };
  }
}

/**
 * プライベートIPアドレスかチェック（ヘルパー）
 */
function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
  ];

  return privateRanges.some(range => range.test(hostname));
}

/**
 * スクレイピング結果を要約（AIに適した形式）
 */
export function summarizeScrapedData(data: ScrapedData): string {
  const parts: string[] = [];

  if (data.title) {
    parts.push(`タイトル: ${data.title}`);
  }

  if (data.metadata?.author) {
    parts.push(`著者: ${data.metadata.author}`);
  }

  if (data.metadata?.publishedAt) {
    parts.push(`公開日: ${data.metadata.publishedAt.toISOString().split('T')[0]}`);
  }

  // 内容（最初の500文字）
  const contentPreview = data.content.length > 500
    ? data.content.substring(0, 500) + '...'
    : data.content;
  
  parts.push(`内容: ${contentPreview}`);

  return parts.join('\n');
}

/**
 * ニュース記事を検出
 */
export function isNewsArticle(data: ScrapedData): boolean {
  // ニュースサイトのドメイン
  const newsDomains = [
    'nikkei.com',
    'asahi.com',
    'mainichi.jp',
    'yomiuri.co.jp',
    'nhk.or.jp',
    'reuters.com',
    'bbc.com',
    'cnn.com',
  ];

  const domain = extractDomain(data.url);
  
  if (newsDomains.some(d => domain.includes(d))) {
    return true;
  }

  // メタデータからの判定
  if (data.metadata?.tags) {
    const newsTags = ['news', 'ニュース', '速報'];
    return data.metadata.tags.some(tag => 
      newsTags.some(newsTag => tag.toLowerCase().includes(newsTag))
    );
  }

  return false;
}

/**
 * ブログ記事を検出
 */
export function isBlogPost(data: ScrapedData): boolean {
  const blogIndicators = [
    '/blog/',
    '/post/',
    '/article/',
    'blog',
    'note.com',
    'medium.com',
    'qiita.com',
    'zenn.dev',
  ];

  const url = data.url.toLowerCase();
  
  return blogIndicators.some(indicator => url.includes(indicator));
}
