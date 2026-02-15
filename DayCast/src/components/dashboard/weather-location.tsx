import { Card } from "@/components/ui/Card";

type HourlyForecast = {
  time: string;
  icon: string;
};

type WeatherLocationData = {
  location: string;
  description: string;
  hourly: HourlyForecast[];
};

export function WeatherLocation({
  data,
}: {
  data: WeatherLocationData | null;
}) {
  if (!data) {
    return (
      <Card title="天気・位置" icon="🌤">
        <p className="text-sm text-slate-400">天気情報を取得できませんでした</p>
      </Card>
    );
  }

  return (
    <Card title="天気・位置" icon="🌤">
      {/* Location */}
      <p className="mb-3 text-sm font-medium text-slate-700">
        {data.location} 📍
      </p>
      <p className="mb-4 text-xs text-slate-500">{data.description}</p>

      {/* Hourly forecast */}
      {data.hourly.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {data.hourly.map((h, index) => (
            <div
              key={`${h.time}-${index}`}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span className="text-lg">{h.icon}</span>
              <span className="text-xs text-slate-500">{h.time}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
