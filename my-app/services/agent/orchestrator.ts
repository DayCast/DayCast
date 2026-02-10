// src/services/agent/orchestrator.ts
import { geminiModel } from "@/lib/gemini";
import { getCurrentWeather } from "@/services/tools/weather";
import { listEvents } from "@/services/tools/calendar";

export async function runAgentOrchestrator(userId: string, userPrompt: string) {
  // 1. Geminiと対話セッションを開始（ツールを使えるようにする）
  const chat = geminiModel.startChat();

  // 2. 最初の問いかけ
  let result = await chat.sendMessage(userPrompt);
  let response = result.response;

  // 3. AIが「関数を呼び出したい」と言っている間、ループを回す
  // これが「エージェントの思考ループ」
  while (response.functionCalls()?.length) {
    const calls = response.functionCalls()!;
    const toolResponses: any[] = [];

    for (const call of calls) {
      console.log(`AIがツールを呼び出しました: ${call.name}`, call.args);

      // 実際のツール（関数）を実行
      let data;
      if (call.name === "getCurrentWeather") {
        const { lat, lon } = call.args as any;
        data = await getCurrentWeather(lat, lon);
      } else if (call.name === "listEvents") {
        const { timeMin } = call.args as any;
        data = await listEvents(userId, timeMin);
      }

      // ツールの実行結果を保存
      toolResponses.push({
        functionResponse: {
          name: call.name,
          response: { content: data },
        },
      });
    }

    // 4. 実行結果をGeminiに返し、次のアクション（または最終回答）を待つ
    result = await chat.sendMessage(toolResponses);
    response = result.response;
  }

  // 最終的なAIの回答テキストを返す
  return response.text();
}