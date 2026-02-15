"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// 新しいTodoを作成する
export async function createTodo(
  userId: string,
  data: {
    title: string;
    dueDate?: string;
    priority?: string;
  }
) {
  try {
    const todo = await prisma.todo.create({
      data: {
        userId,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || "medium",
        status: "pending",
      },
    });

    revalidatePath("/");
    return { success: true, todoId: todo.id };
  } catch (error) {
    console.error("Error creating todo:", error);
    return { success: false, error: "Todoの作成に失敗しました。" };
  }
}

// Todoの完了状態を切り替える
export async function toggleTodoComplete(todoId: string, userId: string) {
  try {
    const todo = await prisma.todo.findUnique({
      where: { id: todoId, userId },
    });

    if (!todo) {
      return { success: false, error: "Todoが見つかりません。" };
    }

    await prisma.todo.update({
      where: { id: todoId },
      data: { status: todo.status === "complete" ? "pending" : "complete" },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling todo:", error);
    return { success: false, error: "Todoの更新に失敗しました。" };
  }
}

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
                aiScore: item.score,
                aiReason: item.reason,
            },
        }))
    );

    revalidatePath("/"); //UIを最新化
    return{ success: true };
}