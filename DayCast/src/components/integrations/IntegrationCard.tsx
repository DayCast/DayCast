"use client";

import { useRouter } from "next/navigation";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync: string | null;
  connectUrl?: string;
};

type IntegrationCardProps = {
  integration: Integration;
};

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const router = useRouter();

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConnect = () => {
    if (integration.connected) {
      // TODO: Show settings modal
      return;
    }
    if (integration.connectUrl) {
      router.push(integration.connectUrl);
    }
  };

  const isConnectable = !integration.connected && !!integration.connectUrl;

  return (
    <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
        {integration.icon}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-800">{integration.name}</h3>
          {integration.connected && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              接続済み
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{integration.description}</p>
        
        {integration.lastSync && (
          <p className="mt-2 text-xs text-slate-400">
            最終同期: {formatLastSync(integration.lastSync)}
          </p>
        )}
      </div>
      
      <button
        onClick={handleConnect}
        disabled={!integration.connected && !integration.connectUrl}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          integration.connected
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
            : isConnectable
            ? "bg-primary text-white hover:bg-blue-700"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {integration.connected ? "設定" : isConnectable ? "連携する" : "自動連携"}
      </button>
    </div>
  );
}
