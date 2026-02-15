"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { toggleTodoComplete } from "@/actions/todo";

type TodoItem = {
  id: string;
  title: string;
  priority: string;
  aiScore: number;
  status: string;
  dueDate: Date | null;
};

export function TodayTodo({ todos, userId }: { todos: TodoItem[]; userId: string }) {
  const [autoMode, setAutoMode] = useState(true);
  const [localTodos, setLocalTodos] = useState(todos);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (todoId: string) => {
    setLocalTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
    startTransition(async () => {
      await toggleTodoComplete(todoId, userId);
    });
  };

  return (
    <Card
      title="今日のTodo"
      icon="☑️"
      action={
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            autoMode ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          Auto {autoMode ? "ON" : "OFF"}
        </button>
      }
    >
      {localTodos.length === 0 ? (
        <p className="text-sm text-slate-400">タスクはありません</p>
      ) : (
        <ul className="space-y-2">
          {localTodos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-3 ${todo.status === "completed" ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary"
                checked={todo.status === "completed"}
                onChange={() => handleToggle(todo.id)}
                disabled={isPending}
              />
              <span
                className={`flex-1 text-sm text-slate-700 ${todo.status === "completed" ? "line-through" : ""}`}
              >
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="text-xs font-medium text-red-500">
                  due {new Date(todo.dueDate).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
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
