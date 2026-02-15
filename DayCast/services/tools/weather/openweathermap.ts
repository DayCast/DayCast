/**
 * OpenWeatherMap プロバイダー実装
 * https://openweathermap.org/api
 */

import type { WeatherData } from '@/types';
import type {
  IWeatherProvider,
  WeatherProviderConfig,
  WeatherProviderError,
} from './base';

/**
 * OpenWeatherMap API レスポンス型
 */
interface OWMCurrentResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
  dt: number;
}

interface OWMForecastResponse {
  city: {
    name: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

/**
 * OpenWeatherMap プロバイダー
 */
export class OpenWeatherMapProvider implements IWeatherProvider {
  readonly name = 'openweathermap' as const;
  
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(config: WeatherProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenWeatherMap requires apiKey');
    }
    this.apiKey = config.apiKey;
  }

  /**
   * 現在の天気を取得
   */
  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&lang=ja`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: OWMCurrentResponse = await response.json();

      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: this.translateCondition(data.weather[0].main),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        fetchedAt: new Date(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 天気予報を取得
   */
  async getForecast(location: string, days: number = 5): Promise<WeatherData> {
    try {
      // OpenWeatherMap の無料プランは5日間予報まで
      const maxDays = Math.min(days, 5);
      
      const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=metric&lang=ja&cnt=${maxDays * 8}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: OWMForecastResponse = await response.json();

      // 日ごとの予報を集計
      const dailyForecasts = this.aggregateDailyForecasts(data.list, maxDays);

      // 現在の天気（最初のデータポイント）
      const current = data.list[0];

      return {
        location: data.city.name,
        temperature: Math.round(current.main.temp),
        condition: this.translateCondition(current.weather[0].main),
        humidity: 0, // 予報APIには含まれない
        windSpeed: 0, // 予報APIには含まれない
        forecast: dailyForecasts,
        fetchedAt: new Date(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentWeather('Tokyo');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 3時間ごとの予報を日ごとに集計
   */
  private aggregateDailyForecasts(
    list: OWMForecastResponse['list'],
    days: number
  ): WeatherData['forecast'] {
    const dailyMap = new Map<string, {
      temps: number[];
      conditions: string[];
    }>();

    // データを日付ごとにグループ化
    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { temps: [], conditions: [] });
      }

      const dayData = dailyMap.get(dateKey)!;
      dayData.temps.push(item.main.temp);
      dayData.conditions.push(item.weather[0].main);
    });

    // 日ごとの平均を計算
    const forecasts: NonNullable<WeatherData['forecast']> = [];
    
    Array.from(dailyMap.entries())
      .slice(0, days)
      .forEach(([dateKey, data]) => {
        const temps = data.temps;
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        
        // 最も頻度の高い天気を選択
        const condition = this.getMostFrequent(data.conditions);

        forecasts.push({
          date: dateKey,
          high,
          low,
          condition: this.translateCondition(condition),
        });
      });

    return forecasts;
  }

  /**
   * 配列内で最も頻度の高い要素を取得
   */
  private getMostFrequent(arr: string[]): string {
    const frequency = new Map<string, number>();
    arr.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    let maxCount = 0;
    let mostFrequent = arr[0];
    
    frequency.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  /**
   * 天気状態を日本語に翻訳
   */
  private translateCondition(condition: string): string {
    const translations: Record<string, string> = {
      'Clear': '晴れ',
      'Clouds': '曇り',
      'Rain': '雨',
      'Drizzle': '小雨',
      'Thunderstorm': '雷雨',
      'Snow': '雪',
      'Mist': '霧',
      'Fog': '霧',
      'Haze': 'もや',
    };

    return translations[condition] || condition;
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any): WeatherProviderError {
    const message = error?.message || 'Unknown OpenWeatherMap error';
    
    // APIキーエラー
    if (message.includes('401') || message.includes('Invalid API key')) {
      return {
        name: 'WeatherProviderError',
        message: 'OpenWeatherMap API key is invalid',
        provider: 'openweathermap',
        originalError: error,
      } as WeatherProviderError;
    }

    // レート制限エラー
    if (message.includes('429')) {
      return {
        name: 'WeatherProviderError',
        message: 'OpenWeatherMap rate limit exceeded',
        provider: 'openweathermap',
        originalError: error,
      } as WeatherProviderError;
    }

    // 場所が見つからない
    if (message.includes('404')) {
      return {
        name: 'WeatherProviderError',
        message: 'Location not found',
        provider: 'openweathermap',
        originalError: error,
      } as WeatherProviderError;
    }

    // その他のエラー
    return {
      name: 'WeatherProviderError',
      message: `OpenWeatherMap error: ${message}`,
      provider: 'openweathermap',
      originalError: error,
    } as WeatherProviderError;
  }
}
