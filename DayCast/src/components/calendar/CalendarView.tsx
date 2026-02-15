"use client";

import { useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
};

type CalendarViewProps = {
  events: CalendarEvent[];
};

type ViewMode = "month" | "week";

export function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };
  
  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* View Mode Toggle */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => setViewMode("month")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "month"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          月
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "week"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          週
        </button>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-slate-800">
          {year}年 {monthNames[month]}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          →
        </button>
      </div>
      
      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((name, i) => (
          <div
            key={name}
            className={`py-2 text-center text-xs font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"
            }`}
          >
            {name}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const dayOfWeek = index % 7;
          
          return (
            <div
              key={index}
              className={`min-h-24 rounded-lg border p-2 ${
                day ? "border-slate-100 bg-slate-50 hover:bg-slate-100" : "border-transparent"
              } ${isToday(day!) ? "border-primary bg-blue-50" : ""}`}
            >
              {day && (
                <>
                  <span
                    className={`text-sm font-medium ${
                      isToday(day)
                        ? "text-primary"
                        : dayOfWeek === 0
                        ? "text-red-400"
                        : dayOfWeek === 6
                        ? "text-blue-400"
                        : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate rounded bg-primary/10 px-1 py-0.5 text-xs text-primary"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-400">
                        +{ dayEvents.length - 2}件
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
