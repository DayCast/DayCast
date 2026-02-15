/**
 * Scraper ツール関数（AI Agent用）
 */

import type { ScrapedData, ToolResult } from '@/types/tools';
import { getScraper } from './index';

export const scrapeWebsite = async (url: string, selector?: string): Promise<ToolResult<ScrapedData>> => {
  const scraper = getScraper();
  return scraper.scrape({ url, selector });
};

export const getWebsiteMetadata = async (url: string): Promise<ToolResult<{ title?: string; description?: string; author?: string }>> => {
  const scraper = getScraper();
  return scraper.getMetadata(url);
};

export const formatScrapedData = (data: ScrapedData): string => {
  let result = `🌐 ${data.url}\n`;
  if (data.title) result += `📝 ${data.title}\n`;
  result += `\n${data.content.substring(0, 500)}`;
  if (data.content.length > 500) result += '...';
  return result;
};

export const isScrapableUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const extractDomain = (url: string): string => {
  try { return new URL(url).hostname; } catch { return url; }
};
