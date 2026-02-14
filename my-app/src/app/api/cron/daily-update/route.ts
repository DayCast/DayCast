// src/app/api/cron/daily-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAgentOrchestrator } from "@/services/agent/orchestrator";

export async function GET(req: NextRequest) {
  // 1. セキュリティ：環境変数に設定した秘密の鍵がヘッダーにあるかチェック
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. AIを回すべきアクティブな全ユーザーを取得
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });

    const results = [];

    // 3. 各ユーザーごとにAIエージェントを実行
    for (const user of users) {
      console.log(`Cron execution started for user: ${user.email}`);
      
      const prompt = "明日の予定とTodoを分析して、優先順位を整理し、必要な準備を提案してください。";
      
      // オーケストレーターを呼び出し（ここでツールもすべて動く）
      const report = await runAgentOrchestrator(user.id, prompt);
      
      results.push({ user: user.email, status: "success" });
    }

    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      details: results
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}