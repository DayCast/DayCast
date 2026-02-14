/**
 * スクレイパーのファクトリーとエクスポート
 */

import type { IScraper } from './base';
import { WebScraper } from './web-scraper';

export * from './base';
export { WebScraper } from './web-scraper';

/**
 * スクレイパーのシングルトンインスタンス
 */
let scraperInstance: IScraper | null = null;

/**
 * スクレイパーインスタンスを取得
 */
export function getScraper(): IScraper {
  if (!scraperInstance) {
    scraperInstance = new WebScraper();
  }
  return scraperInstance;
}

/**
 * スクレイパーインスタンスをリセット
 */
export function resetScraper(): void {
  scraperInstance = null;
}
