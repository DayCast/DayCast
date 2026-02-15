/**
 * 天気プロバイダーのファクトリーとエクスポート
 */

import type { IWeatherProvider, WeatherProviderConfig, WeatherProviderType } from './base';
import { OpenWeatherMapProvider } from './openweathermap';
import { JMAProvider } from './jma';

export * from './base';
export { OpenWeatherMapProvider } from './openweathermap';
export { JMAProvider, getAvailableLocations } from './jma';

/**
 * プロバイダーのファクトリー関数
 */
export function createWeatherProvider(config: WeatherProviderConfig): IWeatherProvider {
  switch (config.type) {
    case 'openweathermap':
      return new OpenWeatherMapProvider(config);
    case 'jma':
      return new JMAProvider(config);
    default:
      throw new Error(`Unknown weather provider type: ${config.type}`);
  }
}

/**
 * 環境変数からプロバイダーを自動選択
 */
export function createWeatherProviderFromEnv(): IWeatherProvider {
  const providerType = (process.env.WEATHER_PROVIDER || 'jma') as WeatherProviderType;
  
  const config: WeatherProviderConfig = {
    type: providerType,
  };

  // OpenWeatherMap用の設定
  if (providerType === 'openweathermap') {
    config.apiKey = process.env.OPENWEATHERMAP_API_KEY;
    
    if (!config.apiKey) {
      throw new Error('OPENWEATHERMAP_API_KEY is required for OpenWeatherMap');
    }
  }

  return createWeatherProvider(config);
}

/**
 * シングルトンインスタンス
 */
let providerInstance: IWeatherProvider | null = null;

export function getWeatherProvider(): IWeatherProvider {
  if (!providerInstance) {
    providerInstance = createWeatherProviderFromEnv();
  }
  return providerInstance;
}

/**
 * プロバイダーインスタンスをリセット
 */
export function resetWeatherProvider(): void {
  providerInstance = null;
}
