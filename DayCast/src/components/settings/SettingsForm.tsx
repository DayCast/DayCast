"use client";

import { useState, useTransition } from "react";
import { updateAISettings, updateUserProfile, updateUserSettings } from "@/actions/settings";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type SettingsFormProps = {
  user: User;
  aiSettings: {
    provider: string;
    model: string;
  };
};

const AI_MODELS: Record<string, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
  vertexai: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  ],
};

export function SettingsForm({ user, aiSettings }: SettingsFormProps) {
  const [name, setName] = useState(user.name || "");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    dailySummary: true,
  });
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "ja",
    timezone: "Asia/Tokyo",
  });
  const [aiProvider, setAiProvider] = useState(aiSettings.provider || "gemini");
  const [aiModel, setAiModel] = useState(aiSettings.model || "gemini-2.0-flash");

  const handleProviderChange = (newProvider: string) => {
    setAiProvider(newProvider);
    const models = AI_MODELS[newProvider];
    if (models && models.length > 0) {
      setAiModel(models[0].value);
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        updateAISettings(aiProvider, aiModel),
        updateUserProfile(name),
        updateUserSettings({
          timezone: preferences.timezone,
          enableNotifications: notifications.email || notifications.push || notifications.dailySummary,
        }),
      ]);
      alert("設定を保存しました");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("設定の保存に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">プロフィール</h2>
        
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
              {(user.name || "U")[0].toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">通知設定</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-700">メール通知</span>
              <p className="text-sm text-slate-500">重要な更新をメールで受け取る</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-700">プッシュ通知</span>
              <p className="text-sm text-slate-500">ブラウザ通知を受け取る</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-700">毎日のサマリー</span>
              <p className="text-sm text-slate-500">朝に1日の予定をまとめて通知</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.dailySummary}
              onChange={(e) =>
                setNotifications({ ...notifications, dailySummary: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* AI Settings Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">AI設定</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              AIプロバイダー
            </label>
            <select
              value={aiProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="gemini">Gemini API</option>
              <option value="vertexai">Vertex AI</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              AIモデル
            </label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {AI_MODELS[aiProvider]?.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <p className="mt-3 text-xs text-slate-400">
          AIプロバイダーとモデルを選択してください。Vertex AIを使用する場合は、Google Cloudの認証設定が必要です。
        </p>
      </div>

      {/* Preferences Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">表示設定</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              テーマ
            </label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences({ ...preferences, theme: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
              <option value="system">システム設定に従う</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              言語
            </label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              タイムゾーン
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences({ ...preferences, timezone: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Asia/Tokyo">日本標準時 (JST)</option>
              <option value="America/New_York">東部標準時 (EST)</option>
              <option value="Europe/London">グリニッジ標準時 (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          設定を保存
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-800">危険ゾーン</h2>
        <p className="mb-4 text-sm text-red-600">
          アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
        </p>
        <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
          アカウントを削除
        </button>
      </div>
    </div>
  );
}
