import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  // ユーザーのAI設定を取得
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { aiProvider: true, aiModel: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">設定</h1>
        <p className="mt-1 text-sm text-slate-500">
          アプリの設定をカスタマイズ
        </p>
      </div>

      <SettingsForm 
        user={session.user} 
        aiSettings={{
          provider: userSettings?.aiProvider ?? "gemini",
          model: userSettings?.aiModel ?? "gemini-2.0-flash",
        }}
      />
    </div>
  );
}
