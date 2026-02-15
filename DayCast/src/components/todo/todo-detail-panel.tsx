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

export function TodoDetailPanel({ todo }: { todo: TodoItemData | null }) {
  if (!todo) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-slate-400">
          タスクを選択して詳細を表示
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <h3 className="text-base font-semibold text-slate-800">{todo.title}</h3>

      {todo.description && (
        <p className="text-sm text-slate-600">{todo.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">優先度</span>
          <span className="font-medium text-slate-700">{todo.priority}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">AIスコア</span>
          <span className="font-bold text-primary">{todo.aiScore}</span>
        </div>
        {todo.dueDate && (
          <div className="flex justify-between">
            <span className="text-slate-500">期限</span>
            <span className="font-medium text-slate-700">
              {new Date(todo.dueDate).toLocaleString("ja-JP")}
            </span>
          </div>
        )}
        {todo.aiReason && (
          <div>
            <span className="text-slate-500">AI理由</span>
            <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              {todo.aiReason}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          完了にする
        </button>
        <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          削除
        </button>
      </div>
    </div>
  );
}
