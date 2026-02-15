"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {runCalendarInfoAgent} from "./agent";

// カレンダー予定を作成，AIによる調査をトリガーとする
export async function createCalendarEvent(userId:string, data:{
    title: string;
    location?: string;
    startTime: string;
    endTime: string;
}){
    try{
        const event = await prisma.calendarEvent.create({
            data:{
                userId,
                title: data.title,
                location: data.location,
                startTime: data.startTime,
                endTime: data.endTime,
            },
        });

        // 非同期でAIを走らせる(情報収集の開始)
        if(data.location){
            runCalendarInfoAgent(event.id);
        }

        revalidatePath("/");
        return { success: true, eventId: event.id };
    } catch (error){
        console.error("Error creating calendar event:", error);
        return { success: false, error: "予定の作成に失敗しました。" };
    }
}