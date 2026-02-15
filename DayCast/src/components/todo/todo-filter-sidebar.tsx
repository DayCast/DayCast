"use client";

type FilterState = {
  status: string;
  label: string;
};

const STATUS_FILTERS = [
  { value: "today", label: "今日" },
  { value: "overdue", label: "期限超過" },
  { value: "week", label: "今週" },
];

const LABEL_FILTERS = [
  { value: "work", label: "仕事", color: "bg-blue-500" },
  { value: "shopping", label: "買い物", color: "bg-green-500" },
];

export function TodoFilterSidebar({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: FilterState;
  onFilterChange: (filter: FilterState) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Status */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-700">状態</h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() =>
                onFilterChange({ ...activeFilter, status: f.value })
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter.status === f.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-700">ラベル</h4>
        <div className="flex flex-wrap gap-2">
          {LABEL_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() =>
                onFilterChange({ ...activeFilter, label: f.value })
              }
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeFilter.label === f.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${f.color}`} />
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
