"use server";

import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini";
import { searchEventPacking, searchWeatherPacking, searchLocationInfo } from "@/services/tools/search/web-search";
import { getWeatherForecast, formatWeatherData, getWeatherAdvice } from "@/services/tools/weather/weather-tools";

type PackSuggestion = {
  tags: string[];
  items: { name: string; reason: string; priority: "high" | "medium" | "low" }[];
};

export async function generatePackSuggestions(
  userId: string,
  weatherDescription: string
): Promise<PackSuggestion> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [events, todos] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: {
          userId,
          startTime: { gte: todayStart, lte: todayEnd },
        },
        select: { title: true, location: true, startTime: true, endTime: true },
      }),
      prisma.todo.findMany({
        where: { userId, status: "pending" },
        select: { title: true, dueDate: true, priority: true },
        take: 10,
      }),
    ]);

    const eventsText = events.length > 0
      ? events.map(e => {
          const time = new Date(e.startTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
          const loc = e.location ? " @" + e.location : "";
          return "- " + e.title + loc + " (" + time + ")";
        }).join("\n")
      : "予定なし";

    const todosText = todos.length > 0
      ? todos.map(t => {
          const due = t.dueDate ? " (期限: " + new Date(t.dueDate).toLocaleDateString("ja-JP") + ")" : "";
          return "- " + t.title + due;
        }).join("\n")
      : "Todoなし";

    // Web検索で追加情報を取得
    const searchPromises: Promise<string>[] = [];
    
    // 天気に基づく検索
    if (weatherDescription) {
      searchPromises.push(searchWeatherPacking(weatherDescription));
    }
    
    // イベントの場所や内容に基づく検索
    const eventKeywords = events
      .slice(0, 2)
      .map(e => e.title || e.location)
      .filter(Boolean);
    
    for (const keyword of eventKeywords) {
      if (keyword) {
        searchPromises.push(searchEventPacking(keyword));
      }
    }
    
    // 場所に基づく検索
    const locations = events
      .map(e => e.location)
      .filter(Boolean)
      .slice(0, 2);
    
    for (const location of locations) {
      if (location) {
        searchPromises.push(searchLocationInfo(location));
      }
    }
    
    const searchResults = await Promise.all(searchPromises);
    const webInfo = searchResults.filter(r => r).join("\n\n");

    // 天気予報を取得（APIキーがあれば）
    let forecastInfo = "";
    let weatherAdvice = "";
    try {
      // ユーザーの設定から場所を取得するか、デフォルトで東京を使用
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { location: true },
      });
      const location = userSettings?.location || "東京";
      
      const forecastResult = await getWeatherForecast(location, 3);
      if (forecastResult.success && forecastResult.data) {
        forecastInfo = formatWeatherData(forecastResult.data);
        weatherAdvice = getWeatherAdvice(forecastResult.data);
      }
    } catch (e) {
      console.log("Weather forecast unavailable:", e);
    }

    const prompt = `あなたは外出時の持ち物アドバイザーです。
以下の情報から持っていくべき物をJSON形式で提案してください。

## 今日の天気
${weatherDescription || "不明"}

## 天気予報（数日間）
${forecastInfo || "予報情報なし"}

## 天気アドバイス
${weatherAdvice || "なし"}

## 今日の予定
${eventsText}

## 今日のTodo
${todosText}

## Web検索による参考情報
${webInfo || "なし"}

## 出力JSON形式
{"tags":["タグ"],"items":[{"name":"持ち物","reason":"理由","priority":"high"}]}
タグ例:雨,寒い,暑い,外出,MTG,運動,勉強,仕事。持ち物は5〜8個。`;

    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found");

    const parsed = JSON.parse(jsonMatch[0]) as PackSuggestion;
    return { tags: parsed.tags || [], items: parsed.items || [] };
  } catch (error) {
    console.error("Pack suggestion error:", error);
    return {
      tags: ["外出"],
      items: [
        { name: "財布", reason: "基本の持ち物", priority: "high" },
        { name: "スマホ", reason: "連絡用", priority: "high" },
        { name: "充電器", reason: "バッテリー切れ防止", priority: "medium" },
      ],
    };
  }
}
