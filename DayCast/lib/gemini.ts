import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AI_SETTINGS } from "@/constants/agent";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  // AIが使えるツール（関数の説明）を定義
  tools: [
    {
      functionDeclarations: [
        {
          name: "listEvents",
          description: "ユーザーのGoogleカレンダーから予定の一覧を取得します",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              timeMin: { type: SchemaType.STRING, description: "検索開始日時(ISO形式)" }
            }
          }
        },
        // 予定作成ツールの定義
        {
          name: "createEvent",
          description: "Googleカレンダーに新しい予定を作成します",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              location: { type: SchemaType.STRING },
              startTime: { type: SchemaType.STRING },
              endTime: { type: SchemaType.STRING }
            },
            required: ["title", "startTime", "endTime"]
          }
        },
        // 天気取得ツールの定義
        {
            name: "getCurrentWeather",
            description: "指定された緯度・経度の現在の天気を取得します",
            parameters: {
            type: SchemaType.OBJECT,
            properties: {
                lat: { type: SchemaType.NUMBER, description: "緯度" },
                lon: { type: SchemaType.NUMBER, description: "経度" }
            },
            required: ["lat", "lon"]
            }
        },
        {
            name: "scrapeWebsite",
            description: "指定されたURLのウェブサイトから情報を取得します",
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                url: { type: SchemaType.STRING, description: "スクレイピング対象のURL" }
              },
              required: ["url"]
            }
        }
      ]
    }
  ]
});