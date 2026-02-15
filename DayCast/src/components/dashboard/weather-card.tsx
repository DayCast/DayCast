type WeatherData = {
  location: string;
  weather: string;
  temperature: string;
};

export function WeatherCard({ data }: { data: WeatherData | null }) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">
          🌤 天気
        </h2>
        <p className="text-sm text-zinc-400">天気情報を取得できませんでした</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-800">
        🌤 天気
      </h2>
      <div className="space-y-2">
        <p className="text-sm text-zinc-600">📍 {data.location}</p>
        <p className="text-2xl font-bold text-zinc-800">{data.temperature}</p>
        <p className="text-sm text-zinc-600">{data.weather}</p>
      </div>
    </div>
  );
}
