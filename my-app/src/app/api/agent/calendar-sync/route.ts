import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCalendarInfoAgent } from "@/actions/agent";
import { HTTP_STATUS } from "@/constants/api";
import { request } from "https";

export async function POST(req: NextRequest) {
    try {
        // リクエストボディからeventIDを取得
        const body = await req.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json(
                { success: false, message: "eventIdが提供されていません。" },
                { status: HTTP_STATUS.BAD_REQUEST }
            );
        }

        // 指定された予定があるか確認
        const event = await prisma.calendarEvent.findUnique({
            where: { id: eventId },
        });
        
        if (!event) {
            return NextResponse.json(
                { success: false, message: "指定された予定が見つかりません。" },
                { status: HTTP_STATUS.NOT_FOUND }
            );
        }

        // AIエージェントを実行
        runCalendarInfoAgent(eventId).catch((err) =>
            console.error("Background agent error:", err)
        );

        return NextResponse.json({
            success: true,
            message: "AIエージェントの実行が開始されました。" 
        });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { success: false, message: "サーバーエラーが発生しました。" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}