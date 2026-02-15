import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";

export default async function IntegrationsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch account and settings
  const [account, settings] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    }),
    prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  const integrations = [
    {
      id: "google-calendar",
      name: "Google カレンダー",
      description: "Googleカレンダーと同期して予定を管理",
      icon: "📅",
      connected: !!account?.refresh_token,
      lastSync: account?.refresh_token ? new Date().toISOString() : null,
      connectUrl: undefined,
    },
    {
      id: "weather",
      name: "気象庁",
      description: "気象庁から天気情報を取得",
      icon: "🌤️",
      connected: true,
      lastSync: new Date().toISOString(),
      connectUrl: undefined,
    },
    {
      id: "slack",
      name: "Slack",
      description: settings?.slackTeamName 
        ? `${settings.slackTeamName}と連携中`
        : "Slackと連携して通知を受け取る",
      icon: "💬",
      connected: !!settings?.slackConnected,
      lastSync: settings?.slackConnected ? new Date().toISOString() : null,
      connectUrl: "/api/integrations/slack/connect",
    },
    {
      id: "notion",
      name: "Notion",
      description: settings?.notionWorkspaceName
        ? `${settings.notionWorkspaceName}と連携中`
        : "Notionのタスクと同期",
      icon: "📝",
      connected: !!settings?.notionConnected,
      lastSync: settings?.notionConnected ? new Date().toISOString() : null,
      connectUrl: "/api/integrations/notion/connect",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">連携サービス</h1>
        <p className="mt-1 text-sm text-slate-500">
          外部サービスと連携して、DayCastをもっと便利に
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 p-4">
        <h3 className="font-medium text-blue-800">ヒント</h3>
        <p className="mt-1 text-sm text-blue-600">
          SlackやNotionを連携すると、毎日のサマリーやタスク同期ができるようになります。
        </p>
      </div>
    </div>
  );
}
