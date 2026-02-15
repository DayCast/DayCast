"use client";

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

export function TodoListItem({
  todo,
  isSelected,
  onClick,
}: {
  todo: TodoItemData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-primary bg-primary-light"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* AI Score Circle */}
        {todo.aiScore > 0 && (
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
            <svg className="h-10 w-10" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-primary"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${todo.aiScore}, 100`}
              />
            </svg>
            <span className="absolute text-xs font-bold text-primary">
              {todo.aiScore}
            </span>
          </div>
        )}

        {/* Checkbox + Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked={todo.status === "completed"}
              className="h-4 w-4 rounded border-slate-300 text-primary"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-sm font-medium text-slate-800">
              {todo.title}
            </span>
          </div>
          {todo.aiReason && (
            <p className="mt-1 ml-6 text-xs text-slate-400">
              Reason: {todo.aiReason}
            </p>
          )}
        </div>

        {/* Due + Duration */}
        <div className="flex flex-col items-end gap-1">
          {todo.dueDate && (
            <span className="text-xs font-medium text-red-500">
              due{" "}
              {new Date(todo.dueDate).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <PriorityBadge priority={todo.priority} />
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[priority] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {priority}
    </span>
  );
}
