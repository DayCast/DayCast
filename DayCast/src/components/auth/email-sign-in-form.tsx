"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function EmailSignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("メールの送信に失敗しました。");
      } else {
        // Redirect to verify-request page
        window.location.href = "/verify-request";
      }
    } catch {
      setError("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレスを入力"
        required
        className="w-full rounded-full border border-slate-300 px-6 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
      >
        {isLoading ? "送信中..." : "メールで続行"}
      </button>
    </form>
  );
}
