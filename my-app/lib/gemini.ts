import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_SETTINGS } from "@/constants/agent";
import { title } from "process";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  // AIが使えるツール（関数の説明）を定義
  tools: [
    {
      functionDeclarations: [
        {
          name: "listEvents",
          description: "ユーザーのGoogleカレンダーから予定の一覧を取得します",
          parameters: {
            type: "object",
            properties: {
              timeMin: { type: "string", description: "検索開始日時(ISO形式)" }
            }
          }
        },
        // 予定作成ツールの定義
        {
          name: "createEvent",
          description: "Googleカレンダーに新しい予定を作成します",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              location: { type: "string" },
              startTime: { type: "string" },
              endTime: { type: "string" }
            },
            required: ["title", "startTime", "endTime"]
          }
        },
        // 天気取得ツールの定義
        {
            name: "getCurrentWeather",
            description: "指定された緯度・経度の現在の天気を取得します",
            parameters: {
            type: "object",
            properties: {
                lat: { type: "number", description: "緯度" },
                lon: { type: "number", description: "経度" }
            },
            required: ["lat", "lon"]
            }
        },
        {
            name: "scrapeWebsite",
            description: "指定されたURLのウェブサイトから情報を取得します",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string", description: "スクレイピング対象のURL" }
              },
              required: ["url"]
            }
        }
      ]
    }
  ]
});