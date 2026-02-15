"use client";

import { useState } from "react";
import { TodoFilterSidebar } from "./todo-filter-sidebar";
import { TodoListItem } from "./todo-list-item";
import { TodoDetailPanel } from "./todo-detail-panel";

type TodoItemData = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  aiScore: number;
  aiReason: string | null;
  status: string;
  dueDate: Date | null;
};

export function TodoPageContent({ todos }: { todos: TodoItemData[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [filter, setFilter] = useState({ status: "today", label: "" });
  const [search, setSearch] = useState("");

  const selectedTodo = todos.find((t) => t.id === selectedId) ?? null;

  const filteredTodos = todos.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Todo
          </button>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              autoMode
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {autoMode ? "Auto" : "Manual"}
          </button>
        </div>
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-sm text-slate-600 placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-44 flex-shrink-0">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              Filters
            </h3>
            <TodoFilterSidebar
              activeFilter={filter}
              onFilterChange={setFilter}
            />
          </div>
        </div>

        {/* Todo List */}
        <div className="flex-1 space-y-2">
          {filteredTodos.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-slate-400">タスクはありません</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                isSelected={selectedId === todo.id}
                onClick={() =>
                  setSelectedId(selectedId === todo.id ? null : todo.id)
                }
              />
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="w-72 flex-shrink-0">
          <TodoDetailPanel todo={selectedTodo} />
        </div>
      </div>
    </div>
  );
}
