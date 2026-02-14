"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// AIによるスコアリング結果を反映してToDoを更新する

export async function updateTodoScore(
    userId: string,
    scoredTodos:{ id: string; score: number, reason: string }[]
){
    await prisma.$transaction(
        scoredTodos.map((item) =>
        prisma.todo.update({        //SQLのUPDATE文に相当
            where: {id:item.id, userId: userId},
            data: {
                score: item.score,
                scoreReason: item.reason,
            },
        }))
    );

    revalidatePath("/"); //UIを最新化
    return{ success: true };
}