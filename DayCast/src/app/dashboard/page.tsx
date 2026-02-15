import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncGoogleCalendarEvents } from "@/lib/google-calendar";
import { runPriorityAgent, runCalendarInfoAgent } from "@/actions/agent";
import { generatePackSuggestions } from "@/actions/pack";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { TodayTodo } from "@/components/dashboard/today-todo";
import { EssentialPack } from "@/components/dashboard/essential-pack";
import { WeatherLocation } from "@/components/dashboard/weather-location";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Google Calendarから今日の予定を同期（エラーは無視）
  try {
    await syncGoogleCalendarEvents(userId);
  } catch (error) {
    console.error("Calendar sync failed:", error);
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // データを取得
  const [todos, events, weatherData] = await Promise.all([
    prisma.todo.findMany({
      where: { userId, status: "pending" },
      orderBy: { aiScore: "desc" },
    }),
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { startTime: "asc" },
    }),
    fetchWeather(),
  ]);

  // AIでTodoの優先度を計算（バックグラウンドで実行、エラーは無視）
  if (todos.length > 0) {
    runPriorityAgent(userId).catch(err => console.error("Priority agent failed:", err));
  }

  // 予定にAI情報を付与（場所がある予定のみ、バックグラウンドで実行）
  for (const event of events) {
    if (event.location && !event.weatherInfo) {
      runCalendarInfoAgent(event.id).catch(err => console.error("Calendar info agent failed:", err));
    }
  }

  // AIによるパック提案を生成
  const packSuggestion = await generatePackSuggestions(
    userId,
    weatherData?.description || ""
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <TodaySchedule events={events} />
      <TodayTodo todos={todos} />
      <EssentialPack 
        tags={packSuggestion.tags} 
        items={packSuggestion.items.map(item => ({
          name: item.name,
          reason: item.reason,
          priority: item.priority,
          checked: false,
        }))} 
      />
      <WeatherLocation data={weatherData} />
    </div>
  );
}

async function fetchWeather() {
  try {
    const res = await fetch(
      "https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const todayForecast = data[0]?.timeSeries?.[0]?.areas?.[0];
    if (!todayForecast) return null;

    const weatherDesc: string = todayForecast.weathers?.[0] ?? "不明";

    const timeDefines: string[] = data[0]?.timeSeries?.[0]?.timeDefines ?? [];
    const weatherCodes: string[] = todayForecast.weatherCodes ?? [];

    const hourly = timeDefines.slice(0, 6).map((t: string, i: number) => ({
      time: new Date(t).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: weatherCodeToIcon(weatherCodes[i] ?? ""),
    }));

    return {
      location: "東京",
      description: weatherDesc,
      hourly,
    };
  } catch {
    return null;
  }
}

function weatherCodeToIcon(code: string): string {
  const c = parseInt(code, 10);
  if (c >= 100 && c < 200) return "☀️";
  if (c >= 200 && c < 300) return "⛅";
  if (c >= 300 && c < 400) return "☁️";
  return "🌧️";
}
