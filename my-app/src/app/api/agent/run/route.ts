// src/app/api/agent/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAgentOrchestrator } from "@/services/agent/orchestrator";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. ユーザー認証の確認
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    const userId = session.user.id;

    // 2. コンテキスト（現在のTodoや予定）を軽く収集
    // これをAIへの初期情報として渡すことで、ツールの使用を促す
    const [todos, events] = await Promise.all([
      prisma.todo.findMany({ where: { userId, status: "pending" } }),
      prisma.calendarEvent.findMany({ 
        where: { userId, startTime: { gte: new Date() } },
        take: 3 
      })
    ]);

    const systemContext = `
      ユーザーの現在のTodo: ${todos.map(t => t.title).join(", ")}
      直近の予定: ${events.map(e => `${e.title}(場所:${e.location})`).join(", ")}
    `;

    // 3. オーケストレーターの実行（ここですべてのツールが動く）
    // AIは必要に応じて weather, calendar, scraper を自動で叩く
    const aiFinalResponse = await runAgentOrchestrator(
      userId, 
      `${systemContext}\n\nユーザーの依頼: ${prompt}`
    );

    // 4. 結果を返却
    return NextResponse.json({
      success: true,
      result: aiFinalResponse
    });

  } catch (error) {
    console.error("AI Agent Runtime Error:", error);
    return NextResponse.json(
      { error: "AIの実行中にエラーが発生しました" },
      { status: 500 }
    );
  }
}