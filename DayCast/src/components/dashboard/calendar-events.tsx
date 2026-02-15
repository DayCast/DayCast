type CalendarEventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
  weatherInfo: unknown;
};

export function CalendarEvents({ events }: { events: CalendarEventItem[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
          📅 今日の予定
        </h2>
        <p className="text-sm text-zinc-400">今日の予定はありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-800">
        📅 今日の予定
      </h2>
      <ul className="space-y-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-lg border border-zinc-100 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            <p className="mt-1 font-medium text-zinc-800">{event.title}</p>
            {event.location && (
              <p className="mt-1 text-xs text-zinc-500">
                📍 {event.location}
              </p>
            )}
            <WeatherBadge weatherInfo={event.weatherInfo} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WeatherBadge({ weatherInfo }: { weatherInfo: unknown }) {
  if (!weatherInfo || typeof weatherInfo !== "object") return null;

  const info = weatherInfo as {
    weather?: string;
    recommendedItems?: string[];
  };

  return (
    <div className="mt-2 rounded-md bg-blue-50 p-2">
      {info.weather && (
        <p className="text-xs text-blue-700">🌤 {info.weather}</p>
      )}
      {info.recommendedItems && info.recommendedItems.length > 0 && (
        <p className="mt-1 text-xs text-blue-600">
          🎒 {info.recommendedItems.join(", ")}
        </p>
      )}
    </div>
  );
}
