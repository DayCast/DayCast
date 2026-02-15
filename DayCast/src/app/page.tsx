import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { SignInButton } from "@/components/auth/sign-in-button";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="DayCast"
            width={80}
            height={80}
            className="rounded-full shadow-md"
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-xl font-bold text-slate-800">
          今日の予定から、必要なものまで自動で整える
        </h1>
        <p className="mb-8 text-center text-sm text-slate-500">
          カレンダー / Todo / 天気 / 位置情報 を1つに
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <SignInButton />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400">または</span>
            </div>
          </div>
          <EmailSignInForm />
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-400">
          <span>利用規約</span>
          <span>|</span>
          <span>プライバシー</span>
          <span>|</span>
          <span>サポート</span>
        </div>
      </main>
    </div>
  );
}
