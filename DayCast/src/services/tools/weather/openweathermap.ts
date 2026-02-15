/**
 * OpenWeatherMap 天気プロバイダー
 * 5日間予報対応
 */

import type { IWeatherProvider, WeatherProviderConfig } from '@/types/provider';
import type { WeatherData } from '@/types/tools';
import { WeatherProviderError } from './jma';

const CONDITION_MAP: Record<string, string> = {
  Clear: '晴れ',
  Clouds: '曇り',
  Rain: '雨',
  Drizzle: '小雨',
  Thunderstorm: '雷雨',
  Snow: '雪',
  Mist: '霧',
  Fog: '霧',
  Haze: 'もや',
};

const translateCondition = (main: string, desc: string): string => {
  return CONDITION_MAP[main] || desc || main;
};

export const createOpenWeatherMapProvider = (config: WeatherProviderConfig): IWeatherProvider => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const baseUrl = 'https://api.openweathermap.org/data/2.5';

  const getCurrentWeather = async (location: string): Promise<WeatherData> => {
    if (!apiKey) {
      throw new WeatherProviderError('OpenWeatherMap APIキーが設定されていません', 'openweathermap');
    }

    const url = baseUrl + '/weather?q=' + encodeURIComponent(location) + '&appid=' + apiKey + '&units=metric&lang=ja';
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new WeatherProviderError('場所が見つかりません: ' + location, 'openweathermap');
      }
      throw new WeatherProviderError('OpenWeatherMap API error: ' + response.status, 'openweathermap');
    }

    const data = await response.json();

    return {
      location: data.name || location,
      temperature: Math.round(data.main?.temp || 0),
      condition: translateCondition(data.weather?.[0]?.main, data.weather?.[0]?.description),
      humidity: data.main?.humidity || 0,
      windSpeed: Math.round((data.wind?.speed || 0) * 10) / 10,
      fetchedAt: new Date(),
    };
  };

  const getForecast = async (location: string, days = 5): Promise<WeatherData> => {
    if (!apiKey) {
      throw new WeatherProviderError('OpenWeatherMap APIキーが設定されていません', 'openweathermap');
    }

    const currentUrl = baseUrl + '/weather?q=' + encodeURIComponent(location) + '&appid=' + apiKey + '&units=metric&lang=ja';
    const currentResponse = await fetch(currentUrl);
    if (!currentResponse.ok) {
      throw new WeatherProviderError('OpenWeatherMap API error: ' + currentResponse.status, 'openweathermap');
    }
    const currentData = await currentResponse.json();

    const forecastUrl = baseUrl + '/forecast?q=' + encodeURIComponent(location) + '&appid=' + apiKey + '&units=metric&lang=ja';
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new WeatherProviderError('OpenWeatherMap Forecast API error: ' + forecastResponse.status, 'openweathermap');
    }
    const forecastData = await forecastResponse.json();

    type DailyData = { temps: number[]; conditions: string[] };
    const dailyForecasts = new Map<string, DailyData>();
    
    for (const item of forecastData.list || []) {
      const date = new Date(item.dt * 1000).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, { temps: [], conditions: [] });
      }
      
      const daily = dailyForecasts.get(date)!;
      daily.temps.push(item.main?.temp || 0);
      daily.conditions.push(item.weather?.[0]?.main || 'Clear');
    }

    const forecast: WeatherData['forecast'] = [];
    let count = 0;
    
    for (const [date, data] of dailyForecasts) {
      if (count >= days) break;
      
      const high = Math.round(Math.max(...data.temps));
      const low = Math.round(Math.min(...data.temps));
      
      const conditionCounts: Record<string, number> = {};
      for (const c of data.conditions) {
        conditionCounts[c] = (conditionCounts[c] || 0) + 1;
      }
      
      const mainCondition = Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';

      forecast.push({
        date,
        high,
        low,
        condition: translateCondition(mainCondition, ''),
      });
      count++;
    }

    return {
      location: currentData.name || location,
      temperature: Math.round(currentData.main?.temp || 0),
      condition: translateCondition(currentData.weather?.[0]?.main, currentData.weather?.[0]?.description),
      humidity: currentData.main?.humidity || 0,
      windSpeed: Math.round((currentData.wind?.speed || 0) * 10) / 10,
      forecast,
      fetchedAt: new Date(),
    };
  };

  const testConnection = async () => {
    try {
      await getCurrentWeather('Tokyo');
      return true;
    } catch {
      return false;
    }
  };

  return { name: 'openweathermap', getCurrentWeather, getForecast, testConnection };
};