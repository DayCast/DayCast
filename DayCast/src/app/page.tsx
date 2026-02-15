import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";

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

        {/* Sign In Button */}
        <div className="space-y-3">
          <SignInButton />
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-slate-400">
          <Link href="/terms" className="hover:text-slate-600 hover:underline">
            利用規約
          </Link>
          <span>|</span>
          <Link href="/privacy" className="hover:text-slate-600 hover:underline">
            プライバシー
          </Link>
        </div>
      </main>
    </div>
  );
}
