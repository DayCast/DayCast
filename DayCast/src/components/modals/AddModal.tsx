"use client";

import { useState } from "react";
import { createTodo } from "@/actions/todo";
import { createCalendarEvent } from "@/actions/calendar";

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
};

type TabType = "todo" | "event";

export function AddModal({ isOpen, onClose, userId }: AddModalProps) {
  const [tab, setTab] = useState<TabType>("todo");
  const [isLoading, setIsLoading] = useState(false);

  // Todo form state
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoPriority, setTodoPriority] = useState("medium");

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");

  if (!isOpen) return null;

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTodo(userId, {
        title: todoTitle,
        dueDate: todoDueDate || undefined,
        priority: todoPriority,
      });
      setTodoTitle("");
      setTodoDueDate("");
      onClose();
    } catch (error) {
      console.error("Failed to create todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createCalendarEvent(userId, {
        title: eventTitle,
        location: eventLocation || undefined,
        startTime: eventStartTime,
        endTime: eventEndTime,
      });
      setEventTitle("");
      setEventLocation("");
      setEventStartTime("");
      setEventEndTime("");
      onClose();
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">新規追加</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("todo")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "todo"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setTab("event")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "event"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            予定
          </button>
        </div>

        {/* Todo Form */}
        {tab === "todo" && (
          <form onSubmit={handleAddTodo} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                タイトル
              </label>
              <input
                type="text"
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="タスクを入力..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                期限
              </label>
              <input
                type="datetime-local"
                value={todoDueDate}
                onChange={(e) => setTodoDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                優先度
              </label>
              <select
                value={todoPriority}
                onChange={(e) => setTodoPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "追加中..." : "Todoを追加"}
            </button>
          </form>
        )}

        {/* Event Form */}
        {tab === "event" && (
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                タイトル
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="予定を入力..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                場所
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="場所を入力..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  開始時間
                </label>
                <input
                  type="datetime-local"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  終了時間
                </label>
                <input
                  type="datetime-local"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "追加中..." : "予定を追加"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
