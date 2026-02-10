// src/services/tools/weather.ts

/**
 * 指定された場所の天気を取得するツール
 * AIは「地名」を渡すので、本来はジオコーディングが必要ですが
 * 今回はAIに緯度・経度を推測させるか、固定の場所でテストします。
 */
export async function getCurrentWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FTokyo`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.current_weather) throw new Error("天気データが取得できませんでした");

    return {
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      conditionCode: data.current_weather.weathercode, // 天気コード
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Weather Tool Error:", error);
    return { error: "天気情報の取得に失敗しました" };
  }
}