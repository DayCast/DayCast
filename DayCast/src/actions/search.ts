"use server";

import { prisma } from "@/lib/prisma";

export interface SearchResult {
  id: string;
  type: "todo" | "calendar";
  title: string;
  date?: string;
}

export async function globalSearch(query: string, userId: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  const todos = await prisma.todo.findMany({
    where: { userId, title: { contains: query, mode: "insensitive" } },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  for (const todo of todos) {
    results.push({
      id: todo.id,
      type: "todo",
      title: todo.title,
      date: todo.dueDate ? new Date(todo.dueDate).toLocaleDateString("ja-JP") : undefined,
    });
  }

  const events = await prisma.calendarEvent.findMany({
    where: { userId, title: { contains: query, mode: "insensitive" } },
    take: 5,
    orderBy: { startTime: "desc" },
  });

  for (const event of events) {
    results.push({
      id: event.id,
      type: "calendar",
      title: event.title,
      date: new Date(event.startTime).toLocaleDateString("ja-JP"),
    });
  }

  return results.slice(0, 10);
}
