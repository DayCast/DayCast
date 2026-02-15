// src/services/tools/scraper.ts
import * as cheerio from 'cheerio';

/**
 * 指定されたURLからテキスト情報を抽出するツール
 */
export async function scrapeWebsite(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YOPPY-Bot/1.0;)'
      }
    });
    
    if (!response.ok) throw new Error("ページを読み込めませんでした");

    const html = await response.text();
    const $ = cheerio.load(html);

    // 不要なタグ（スクリプト、スタイルなど）を削除
    $('script, style, nav, footer, header').remove();

    // タイトルと主要なテキストを抽出
    const title = $('title').text();
    const content = $('main, article, #content').text() || $('body').text();

    // AIが読みやすいように、長すぎるテキストは適度にカット
    const cleanContent = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000); 

    return {
      title,
      summary: cleanContent,
      sourceUrl: url
    };
  } catch (error) {
    console.error("Scraper Tool Error:", error);
    return { error: "サイトの情報を取得できませんでした" };
  }
}