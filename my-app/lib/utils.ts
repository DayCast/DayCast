import {z} from "zod";

// AIに守ってほしい型を定義する
const ScoredTodoSchema = z.array(
    z.object({
        id: z.string(),
        score: z.number().min(0).max(100),
        reason: z.string(),
    })
)

export function safeParseAiResponse(rawText: string) {
    try{
        // 正規表現でJSON部分だけを抽出
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("JSON形式のデータが見つかりませんでした。");

        const json = JSON.parse(jsonMatch[0]);

        // zodで中身が正しいかをチェック
        // 型が違えばここでエラーになる
        return ScoredTodoSchema.parse(json);
    } catch (e) {
        console.error("AIのレスポンスのパースに失敗:", e);
        return null; // エラーの場合はnullを返す
    }