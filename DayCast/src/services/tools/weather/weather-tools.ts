/**
 * Weather ツール関数（AI Agent用）
 */

import type { WeatherData, ToolResult } from '@/types/tools';
import { getWeatherProvider } from './index';

export const getCurrentWeather = async (location: string): Promise<ToolResult<WeatherData>> => {
  try {
    const provider = getWeatherProvider();
    const data = await provider.getCurrentWeather(location);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '天気情報の取得に失敗しました' };
  }
};

export const getWeatherForecast = async (location: string, days: number = 5): Promise<ToolResult<WeatherData>> => {
  try {
    const provider = getWeatherProvider();
    const data = await provider.getForecast(location, days);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '天気予報の取得に失敗しました' };
  }
};

export const formatWeatherData = (data: WeatherData): string => {
  let result = `📍 ${data.location}\n🌡️ 気温: ${data.temperature}°C\n🌤️ 天気: ${data.condition}\n`;
  if (data.humidity > 0) result += `💧 湿度: ${data.humidity}%\n`;
  if (data.windSpeed > 0) result += `💨 風速: ${data.windSpeed}m/s\n`;
  if (data.forecast && data.forecast.length > 0) {
    result += `\n📅 予報:\n`;
    for (const f of data.forecast) result += `  ${f.date}: ${f.condition} (${f.low}°C〜${f.high}°C)\n`;
  }
  return result;
};

export const getWeatherAdvice = (data: WeatherData): string => {
  const advices: string[] = [];
  if (data.condition.includes('雨') || data.condition.includes('雪')) advices.push('☂️ 傘を持っていきましょう');
  if (data.temperature < 5) advices.push('🧥 厚手のコートが必要です');
  else if (data.temperature < 15) advices.push('🧣 上着を持っていきましょう');
  else if (data.temperature > 30) advices.push('🥤 水分補給をこまめにしましょう');
  if (data.humidity > 80) advices.push('💦 湿度が高いです');
  if (data.windSpeed > 10) advices.push('🌬️ 風が強いです');
  return advices.length > 0 ? advices.join('\n') : '✨ 過ごしやすい天気です';
};
