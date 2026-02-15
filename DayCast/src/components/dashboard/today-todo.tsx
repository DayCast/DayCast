"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

type TodoItem = {
  id: string;
  title: string;
  priority: string;
  aiScore: number;
  status: string;
  dueDate: Date | null;
};

export function TodayTodo({ todos }: { todos: TodoItem[] }) {
  const [autoMode, setAutoMode] = useState(true);

  return (
    <Card
      title="今日のTodo"
      icon="☑️"
      action={
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            autoMode
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          Auto {autoMode ? "ON" : "OFF"}
        </button>
      }
    >
      {todos.length === 0 ? (
        <p className="text-sm text-slate-400">タスクはありません</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary"
                defaultChecked={todo.status === "completed"}
              />
              <span className="flex-1 text-sm text-slate-700">
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="text-xs font-medium text-red-500">
                  due{" "}
                  {new Date(todo.dueDate).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {todo.aiScore > 0 && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
                  {todo.aiScore}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
