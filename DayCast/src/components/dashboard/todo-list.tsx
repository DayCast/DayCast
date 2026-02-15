type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  aiScore: number;
  aiReason: string | null;
  status: string;
  dueDate: Date | null;
};

export function TodoList({ todos }: { todos: TodoItem[] }) {
  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
          🎯 今日のタスク
        </h2>
        <p className="text-sm text-zinc-400">タスクはまだありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-800">
        🎯 今日のタスク
      </h2>
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3"
          >
            <PriorityBadge priority={todo.priority} score={todo.aiScore} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-800">{todo.title}</p>
              {todo.aiReason && (
                <p className="mt-1 text-xs text-zinc-400">{todo.aiReason}</p>
              )}
              {todo.dueDate && (
                <p className="mt-1 text-xs text-zinc-500">
                  期限: {new Date(todo.dueDate).toLocaleDateString("ja-JP")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PriorityBadge({
  priority,
  score,
}: {
  priority: string;
  score: number;
}) {
  const color =
    priority === "high"
      ? "bg-red-100 text-red-700"
      : priority === "medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {score > 0 ? score : priority}
    </span>
  );
}
