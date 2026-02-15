/**
 * Scraper プロバイダーのテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('WebScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createWebScraper がIScraperインターフェースを返す', async () => {
    const { createWebScraper } = await import('@/services/tools/scraper/web-scraper');
    const scraper = createWebScraper();

    expect(typeof scraper.scrape).toBe('function');
    expect(typeof scraper.scrapeMultiple).toBe('function');
    expect(typeof scraper.getMetadata).toBe('function');
  });

  it('scrape がHTMLからテキストを抽出する', async () => {
    const html = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <article><p>Hello World Content</p></article>
        </body>
      </html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(html),
      headers: new Map([['content-type', 'text/html']]),
    });

    const { createWebScraper } = await import('@/services/tools/scraper/web-scraper');
    const scraper = createWebScraper();
    const result = await scraper.scrape({ url: 'https://example.com' });

    expect(result.success).toBe(true);
    expect(result.data?.content).toContain('Hello World Content');
    expect(result.data?.url).toBe('https://example.com');
  });

  it('localhost URLをブロックする', async () => {
    const { createWebScraper } = await import('@/services/tools/scraper/web-scraper');
    const scraper = createWebScraper();
    const result = await scraper.scrape({ url: 'http://localhost:3000' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('getMetadata がOGタグを抽出する', async () => {
    const html = `
      <html>
        <head>
          <title>OG Test</title>
          <meta property="og:title" content="OG Title" />
          <meta property="og:description" content="OG Desc" />
          <meta name="author" content="Test Author" />
        </head>
        <body><p>Content</p></body>
      </html>
    `;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(html),
      headers: new Map([['content-type', 'text/html']]),
    });

    const { createWebScraper } = await import('@/services/tools/scraper/web-scraper');
    const scraper = createWebScraper();
    const result = await scraper.getMetadata('https://example.com');

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('OG Title');
    expect(result.data?.description).toBe('OG Desc');
    expect(result.data?.author).toBe('Test Author');
  });
});

describe('Scraper Factory', () => {
  it('getScraper がシングルトンを返す', async () => {
    const { getScraper, resetScraper } = await import('@/services/tools/scraper/index');
    resetScraper();

    const s1 = getScraper();
    const s2 = getScraper();
    expect(s1).toBe(s2);
  });

  it('resetScraper で新しいインスタンスが作られる', async () => {
    const { getScraper, resetScraper } = await import('@/services/tools/scraper/index');
    const s1 = getScraper();
    resetScraper();
    const s2 = getScraper();
    expect(s1).not.toBe(s2);
  });
});
