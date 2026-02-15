/**
 * Web検索サービス
 * DuckDuckGo Instant Answer APIを使用
 */

export type SearchResult = {
  title: string;
  snippet: string;
  url?: string;
};

export type WebSearchResult = {
  query: string;
  results: SearchResult[];
  relatedTopics: string[];
};

/**
 * DuckDuckGoインスタントアンサーで情報を取得
 */
export async function searchWeb(query: string): Promise<WebSearchResult> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];
    const relatedTopics: string[] = [];

    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        snippet: data.Abstract,
        url: data.AbstractURL,
      });
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(" - ")[0] || "",
            snippet: topic.Text,
            url: topic.FirstURL,
          });
          relatedTopics.push(topic.Text.split(" - ")[0] || topic.Text.substring(0, 50));
        }
      }
    }

    if (data.Answer) {
      results.unshift({
        title: "回答",
        snippet: data.Answer,
      });
    }

    return { query, results, relatedTopics };
  } catch (error) {
    console.error("Web search error:", error);
    return { query, results: [], relatedTopics: [] };
  }
}

/**
 * 場所に関する情報を検索
 */
export async function searchLocationInfo(location: string): Promise<string> {
  const result = await searchWeb(`${location} 持ち物 準備`);
  if (result.results.length > 0) {
    return result.results.map(r => r.snippet).join("\\n").substring(0, 500);
  }
  return "";
}

/**
 * イベントタイプに基づく持ち物情報を検索
 */
export async function searchEventPacking(eventType: string): Promise<string> {
  const result = await searchWeb(`${eventType} 持ち物 必需品`);
  if (result.results.length > 0) {
    return result.results.map(r => r.snippet).join("\\n").substring(0, 500);
  }
  return "";
}

/**
 * 天気に基づく持ち物アドバイスを検索
 */
export async function searchWeatherPacking(weather: string): Promise<string> {
  const result = await searchWeb(`${weather} 外出 持ち物 対策`);
  if (result.results.length > 0) {
    return result.results.map(r => r.snippet).join("\\n").substring(0, 500);
  }
  return "";
}
