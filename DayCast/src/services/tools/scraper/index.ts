/**
 * Scraper シングルトン管理
 */

import type { IScraper } from '@/types/provider';
import { createWebScraper } from './web-scraper';

export { ScraperError } from './web-scraper';

let scraperInstance: IScraper | null = null;

export const getScraper = (): IScraper => {
  if (!scraperInstance) scraperInstance = createWebScraper();
  return scraperInstance;
};

export const resetScraper = (): void => { scraperInstance = null; };
