/**
 * 気象庁API プロバイダー実装
 * https://www.jma.go.jp/bosai/forecast/
 * 
 * 注意: 気象庁APIは公式APIではなく、予告なく変更される可能性があります
 */

import type { WeatherData } from '@/types';
import type {
  IWeatherProvider,
  WeatherProviderConfig,
  WeatherProviderError,
} from './base';

/**
 * 主要都市コード（気象庁地域コード）
 */
const AREA_CODES: Record<string, string> = {
  '北海道': '016000',
  '札幌': '016000',
  '青森': '020000',
  '岩手': '030000',
  '宮城': '040000',
  '仙台': '040000',
  '秋田': '050000',
  '山形': '060000',
  '福島': '070000',
  '茨城': '080000',
  '栃木': '090000',
  '群馬': '100000',
  '埼玉': '110000',
  '千葉': '120000',
  '東京': '130000',
  '神奈川': '140000',
  '横浜': '140000',
  '新潟': '150000',
  '富山': '160000',
  '石川': '170000',
  '福井': '180000',
  '山梨': '190000',
  '長野': '200000',
  '岐阜': '210000',
  '静岡': '220000',
  '愛知': '230000',
  '名古屋': '230000',
  '三重': '240000',
  '滋賀': '250000',
  '京都': '260000',
  '大阪': '270000',
  '兵庫': '280000',
  '神戸': '280000',
  '奈良': '290000',
  '和歌山': '300000',
  '鳥取': '310000',
  '島根': '320000',
  '岡山': '330000',
  '広島': '340000',
  '山口': '350000',
  '徳島': '360000',
  '香川': '370000',
  '愛媛': '380000',
  '高知': '390000',
  '福岡': '400000',
  '佐賀': '410000',
  '長崎': '420000',
  '熊本': '430000',
  '大分': '440000',
  '宮崎': '450000',
  '鹿児島': '460100',
  '沖縄': '471000',
  '那覇': '471000',
};

/**
 * 気象庁API レスポンス型
 */
interface JMAForecastResponse {
  publishingOffice: string;
  reportDatetime: string;
  timeSeries: Array<{
    timeDefines: string[];
    areas: Array<{
      area: {
        name: string;
        code: string;
      };
      weatherCodes?: string[];
      weathers?: string[];
      winds?: string[];
      waves?: string[];
      temps?: string[];
      pops?: string[];  // 降水確率
    }>;
  }>;
}

/**
 * 気象庁API プロバイダー
 */
export class JMAProvider implements IWeatherProvider {
  readonly name = 'jma' as const;
  
  private baseUrl = 'https://www.jma.go.jp/bosai/forecast/data/forecast';

  constructor(config: WeatherProviderConfig) {
    // 気象庁APIはAPIキー不要
  }

  /**
   * 現在の天気を取得
   */
  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      const areaCode = this.getAreaCode(location);
      const url = `${this.baseUrl}/${areaCode}.json`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: JMAForecastResponse[] = await response.json();
      
      // 最初の予報データを使用
      const forecast = data[0];
      const timeSeries = forecast.timeSeries[0];
      const area = timeSeries.areas[0];
      
      // 今日の天気
      const todayWeather = area.weathers?.[0] || '不明';
      const todayTemp = timeSeries.areas.find(a => a.temps)?.temps?.[0];

      // 気象庁APIには現在の気温が含まれないため、予報の気温を使用
      const temperature = todayTemp ? parseInt(todayTemp) : 0;

      return {
        location: this.normalizeLocationName(location),
        temperature,
        condition: this.extractCondition(todayWeather),
        humidity: 0,  // 気象庁APIには含まれない
        windSpeed: 0, // 気象庁APIには含まれない
        fetchedAt: new Date(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 天気予報を取得
   */
  async getForecast(location: string, days: number = 7): Promise<WeatherData> {
    try {
      const areaCode = this.getAreaCode(location);
      const url = `${this.baseUrl}/${areaCode}.json`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: JMAForecastResponse[] = await response.json();
      
      const forecast = data[0];
      const timeSeries = forecast.timeSeries[0];
      const tempSeries = forecast.timeSeries.find(ts => 
        ts.areas.some(a => a.temps)
      );
      
      const area = timeSeries.areas[0];
      const tempArea = tempSeries?.areas.find(a => a.temps);

      // 日ごとの予報を作成
      const forecasts: NonNullable<WeatherData['forecast']> = [];
      const maxDays = Math.min(days, timeSeries.timeDefines.length);

      for (let i = 0; i < maxDays; i++) {
        const dateStr = timeSeries.timeDefines[i].split('T')[0];
        const weather = area.weathers?.[i] || '不明';
        const temp = tempArea?.temps?.[i];

        forecasts.push({
          date: dateStr,
          high: temp ? parseInt(temp) : 20,
          low: temp ? parseInt(temp) - 5 : 15,
          condition: this.extractCondition(weather),
        });
      }

      // 今日の天気情報
      const todayWeather = area.weathers?.[0] || '不明';
      const todayTemp = tempArea?.temps?.[0];

      return {
        location: this.normalizeLocationName(location),
        temperature: todayTemp ? parseInt(todayTemp) : 0,
        condition: this.extractCondition(todayWeather),
        humidity: 0,
        windSpeed: 0,
        forecast: forecasts,
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
      await this.getCurrentWeather('東京');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 地域コードを取得
   */
  private getAreaCode(location: string): string {
    // 完全一致を試す
    const code = AREA_CODES[location];
    if (code) return code;

    // 部分一致を試す
    const normalizedLocation = location.replace(/都|道|府|県|市/, '');
    for (const [key, value] of Object.entries(AREA_CODES)) {
      if (key.includes(normalizedLocation) || normalizedLocation.includes(key)) {
        return value;
      }
    }

    throw new Error(`Location "${location}" not found. Available locations: ${Object.keys(AREA_CODES).join(', ')}`);
  }

  /**
   * 天気テキストから状態を抽出
   */
  private extractCondition(weatherText: string): string {
    if (weatherText.includes('晴')) return '晴れ';
    if (weatherText.includes('曇')) return '曇り';
    if (weatherText.includes('雨')) return '雨';
    if (weatherText.includes('雪')) return '雪';
    if (weatherText.includes('雷')) return '雷雨';
    if (weatherText.includes('霧')) return '霧';
    
    return weatherText.split(/[\s　]/)[0] || '不明';
  }

  /**
   * 地域名を正規化
   */
  private normalizeLocationName(location: string): string {
    // 都道府県名を追加
    const withSuffix: Record<string, string> = {
      '東京': '東京都',
      '大阪': '大阪府',
      '京都': '京都府',
      '北海道': '北海道',
    };

    if (withSuffix[location]) {
      return withSuffix[location];
    }

    // 県名がない場合は追加
    if (!location.match(/都|道|府|県/)) {
      return location + '県';
    }

    return location;
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any): WeatherProviderError {
    const message = error?.message || 'Unknown JMA error';
    
    // 場所が見つからない
    if (message.includes('not found')) {
      return {
        name: 'WeatherProviderError',
        message: `Location not found. ${message}`,
        provider: 'jma',
        originalError: error,
      } as WeatherProviderError;
    }

    // API接続エラー
    if (message.includes('404') || message.includes('fetch')) {
      return {
        name: 'WeatherProviderError',
        message: 'JMA API connection failed. The service might be temporarily unavailable.',
        provider: 'jma',
        originalError: error,
      } as WeatherProviderError;
    }

    // その他のエラー
    return {
      name: 'WeatherProviderError',
      message: `JMA error: ${message}`,
      provider: 'jma',
      originalError: error,
    } as WeatherProviderError;
  }
}

/**
 * 利用可能な地域一覧を取得
 */
export function getAvailableLocations(): string[] {
  return Object.keys(AREA_CODES);
}
