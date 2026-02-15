/**
 * Weather プロバイダー（JMAまたはOpenWeatherMap）
 */

import type { IWeatherProvider } from '@/types/provider';
import { createJMAProvider } from './jma';
import { createOpenWeatherMapProvider } from './openweathermap';

export { WeatherProviderError } from './jma';

let providerInstance: IWeatherProvider | null = null;

export const getWeatherProvider = (): IWeatherProvider => {
  if (!providerInstance) {
    const providerType = process.env.WEATHER_PROVIDER || 'jma';
    
    if (providerType === 'openweathermap' && process.env.OPENWEATHERMAP_API_KEY) {
      providerInstance = createOpenWeatherMapProvider({ type: 'openweathermap' });
    } else {
      providerInstance = createJMAProvider({ type: 'jma' });
    }
  }
  return providerInstance;
};

export const resetWeatherProvider = (): void => { providerInstance = null; };
