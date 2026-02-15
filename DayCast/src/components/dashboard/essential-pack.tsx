"use client";

import { Card } from "@/components/ui/Card";

type PackItem = {
  name: string;
  reason: string;
  priority: "high" | "medium" | "low";
  checked: boolean;
};

const TAG_STYLES: Record<string, string> = {
  "雨": "bg-blue-100 text-blue-700",
  "寒い": "bg-indigo-100 text-indigo-700",
  "暑い": "bg-orange-100 text-orange-700",
  "外出": "bg-green-100 text-green-700",
  "MTG": "bg-purple-100 text-purple-700",
  "運動": "bg-pink-100 text-pink-700",
  "勉強": "bg-yellow-100 text-yellow-700",
  "仕事": "bg-slate-100 text-slate-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "border-l-red-400",
  medium: "border-l-yellow-400",
  low: "border-l-slate-300",
};

export function EssentialPack({
  tags,
  items,
}: {
  tags: string[];
  items: PackItem[];
}) {
  return (
    <Card title="最低限パック" icon="🎒">
      {/* AI Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2 py-0.5 text-xs font-medium text-white">
          AI提案
        </span>
        <span className="text-xs text-slate-400">天気・予定・Todoから分析</span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                TAG_STYLES[tag] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">
          予定に基づく持ち物提案はありません
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li 
              key={item.name} 
              className={`flex items-start gap-3 rounded-lg border-l-4 bg-slate-50 p-2 ${
                PRIORITY_STYLES[item.priority]
              }`}
            >
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <p className="text-xs text-slate-400">{item.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
