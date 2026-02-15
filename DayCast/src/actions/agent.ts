"use server"

import { prisma } from "@/lib/prisma";
import { geminiModel } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import { 
  AgentResponse, 
  AgentTask, 
  AiScoredTodoListSchema 
} from "@/types/agent";

export async function runPriorityAgent(userId: string): Promise<AgentResponse> {
  // 1. AgentTask（実行ログ）の初期化
  // 本来はDBのAgentTaskテーブルに'running'で作成するのが理想的です
  const taskLog: AgentTask = {
    id: crypto.randomUUID(), // 仮のID
    userId,
    type: 'calendar', // 既存のAgentToolTypeから選択
    status: 'running',
    input: { action: 'priority_scoring' },
    createdAt: new Date(),
  };

  try {
    // 2. コンテキスト取得
    const todos = await prisma.todo.findMany({ 
      where: { userId, status: "pending" } 
    });

    // 3. AI推論 (Gemini)
    const prompt = `以下のタスクをスコアリングしてJSONで返して：${JSON.stringify(todos)}`;
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text();

    // 4. 堅牢なパース（先ほどの手法）
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("JSON not found");
    
    const validated = AiScoredTodoListSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!validated.success) throw new Error("Format invalid");

    // 5. DB更新
    await prisma.$transaction(
      validated.data.map(item => prisma.todo.update({
        where: { id: item.id, userId },
        data: { aiScore: item.score, aiReason: item.reason }
      }))
    );

    // 成功記録
    taskLog.status = 'success';
    taskLog.output = { scoredCount: validated.data.length };
    taskLog.completedAt = new Date();

    revalidatePath("/");

    // 6. 既存の AgentResponse 型に則って返す
    return {
      success: true,
      message: "優先順位の再計算が完了しました。",
      tasksExecuted: [taskLog], // 実行したタスクのログを添える
    };

  } catch (error: any) {
    // 失敗記録
    taskLog.status = 'failed';
    taskLog.error = error.message;
    taskLog.completedAt = new Date();

    return {
      success: false,
      message: "AIエージェントの実行中にエラーが発生しました。",
      tasksExecuted: [taskLog],
    };
  }
}

// カレンダーの予定に基づき，天気や持ち物を調査してDBを更新

export async function runCalendarInfoAgent(eventId: string) {
    try{
        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });
        if(!event || !event.location) return;

        const prompt = `
            以下の予定について，その場所の「予測される天気と」「持って行くべきものリスト(3~5つ)」を教えてください。

            予定: ${event.title}
            場所: ${event.location}
            日時: ${event.startTime} から ${event.endTime}

            出力は必ず以下のJSON形式でお願いします：
            {
                "weather": "天気の簡単な説明",
                "items": ["持ち物1", "持ち物2", "..."]
            }
        `;

        const result = await geminiModel.generateContent(prompt);
        const rawText = result.response.text();

        // JSON部分を抽出してパース
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if(!jsonMatch) return;

        const info = JSON.parse(jsonMatch[0]);

        // DBのCalendarEvent更新
        await prisma.calendarEvent.update({
            where: { id: eventId },
            data: {
                weatherInfo: info.weather,          // json型のカラム
                recommendedItems: info.items,       // json型のカラム
            },
        });

        revalidatePath("/");
    } catch (error){
        console.error("Error in runCalendarInfoAgent:", error);
    }
}