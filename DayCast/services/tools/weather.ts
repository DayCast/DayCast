/**
 * 天気情報取得ツール
 * AIエージェントから呼び出されるメインインターフェース
 */

import type { WeatherData, ToolResult } from '@/types';
import { getWeatherProvider } from './weather';

/**
 * 現在の天気を取得
 */
export async function getCurrentWeather(location: string): Promise<ToolResult<WeatherData>> {
  try {
    const provider = getWeatherProvider();
    const data = await provider.getCurrentWeather(location);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 天気予報を取得
 */
export async function getWeatherForecast(
  location: string,
  days: number = 5
): Promise<ToolResult<WeatherData>> {
  try {
    const provider = getWeatherProvider();
    const data = await provider.getForecast(location, days);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 天気情報を人間が読みやすい形式でフォーマット
 */
export function formatWeatherData(weather: WeatherData): string {
  const { location, temperature, condition, humidity, windSpeed, forecast } = weather;
  
  let result = `📍 ${location}\n`;
  result += `🌡️ 気温: ${temperature}℃\n`;
  result += `☁️ 天気: ${condition}\n`;
  
  if (humidity > 0) {
    result += `💧 湿度: ${humidity}%\n`;
  }
  
  if (windSpeed > 0) {
    result += `💨 風速: ${windSpeed}m/s\n`;
  }

  if (forecast && forecast.length > 0) {
    result += `\n📅 予報:\n`;
    forecast.forEach((day, index) => {
      const dateObj = new Date(day.date);
      const dateStr = dateObj.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });
      
      const emoji = index === 0 ? '📌' : '  ';
      result += `${emoji} ${dateStr}: ${day.condition} (最高: ${day.high}℃ / 最低: ${day.low}℃)\n`;
    });
  }

  return result;
}

/**
 * 天気に基づくアドバイスを生成
 */
export function getWeatherAdvice(weather: WeatherData): string[] {
  const advice: string[] = [];
  
  // 天気による助言
  if (weather.condition.includes('雨')) {
    advice.push('☔ 傘を持っていきましょう');
  }
  
  if (weather.condition.includes('雪')) {
    advice.push('⛄ 防寒対策と滑りにくい靴を準備しましょう');
  }
  
  if (weather.condition.includes('雷')) {
    advice.push('⚡ 外出時は雷に注意してください');
  }

  // 気温による助言
  if (weather.temperature >= 30) {
    advice.push('🥵 熱中症に注意。こまめな水分補給を');
  } else if (weather.temperature >= 25) {
    advice.push('😎 暑くなりそうです。日焼け対策を');
  } else if (weather.temperature <= 5) {
    advice.push('🧥 寒いです。暖かい服装で');
  } else if (weather.temperature <= 10) {
    advice.push('🧣 肌寒いです。上着を持っていきましょう');
  }

  // 風速による助言
  if (weather.windSpeed >= 10) {
    advice.push('💨 風が強いです。飛ばされやすいものに注意');
  }

  // 湿度による助言
  if (weather.humidity >= 70) {
    advice.push('💧 湿度が高いです。不快指数高め');
  }

  return advice;
}

/**
 * 天気プロバイダーの接続テスト
 */
export async function testWeatherConnection(): Promise<boolean> {
  try {
    const provider = getWeatherProvider();
    return await provider.testConnection();
  } catch {
    return false;
  }
}
