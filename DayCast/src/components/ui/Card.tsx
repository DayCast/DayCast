import type { ReactNode } from "react";

export function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
