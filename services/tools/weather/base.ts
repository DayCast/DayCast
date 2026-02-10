/**
 * 天気プロバイダーの共通インターフェース
 */

import type { WeatherData } from '@/types';

/**
 * 天気プロバイダーの種類
 */
export type WeatherProviderType = 'openweathermap' | 'jma';

/**
 * 天気プロバイダーの設定
 */
export interface WeatherProviderConfig {
  type: WeatherProviderType;
  apiKey?: string;  // OpenWeatherMap用（JMAは不要）
}

/**
 * 天気取得オプション
 */
export interface WeatherOptions {
  location: string;     // 場所（例: 東京、Tokyo）
  date?: Date;          // 日付（省略時は今日）
  days?: number;        // 予報日数（1-7日、デフォルト: 1）
  units?: 'metric' | 'imperial';  // 単位（metric: ℃, imperial: ℉）
}

/**
 * 天気プロバイダーの基底インターフェース
 */
export interface IWeatherProvider {
  /**
   * プロバイダー名
   */
  readonly name: WeatherProviderType;

  /**
   * 現在の天気を取得
   */
  getCurrentWeather(location: string): Promise<WeatherData>;

  /**
   * 天気予報を取得
   */
  getForecast(
    location: string,
    days?: number
  ): Promise<WeatherData>;

  /**
   * 接続テスト
   */
  testConnection(): Promise<boolean>;
}

/**
 * 天気プロバイダーエラー
 */
export class WeatherProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: WeatherProviderType,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WeatherProviderError';
  }
}
