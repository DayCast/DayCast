/**
 * JMA (気象庁) 天気プロバイダー
 * class禁止ルール対応: ファクトリ関数 + クロージャ
 */

import type { IWeatherProvider, WeatherProviderConfig } from '@/types/provider';
import type { WeatherData } from '@/types/tools';

// Error継承は許可
export class WeatherProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'WeatherProviderError';
  }
}

const AREA_CODES: Record<string, string> = {
  '北海道': '016000', '札幌': '016000', '青森': '020000', '岩手': '030000',
  '宮城': '040000', '仙台': '040000', '秋田': '050000', '山形': '060000',
  '福島': '070000', '茨城': '080000', '栃木': '090000', '群馬': '100000',
  '埼玉': '110000', '千葉': '120000', '東京': '130000', '神奈川': '140000',
  '横浜': '140000', '新潟': '150000', '富山': '160000', '石川': '170000',
  '福井': '180000', '山梨': '190000', '長野': '200000', '岐阜': '210000',
  '静岡': '220000', '愛知': '230000', '名古屋': '230000', '三重': '240000',
  '滋賀': '250000', '京都': '260000', '大阪': '270000', '兵庫': '280000',
  '神戸': '280000', '奈良': '290000', '和歌山': '300000', '鳥取': '310000',
  '島根': '320000', '岡山': '330000', '広島': '340000', '山口': '350000',
  '徳島': '360000', '香川': '370000', '愛媛': '380000', '高知': '390000',
  '福岡': '400000', '佐賀': '410000', '長崎': '420000', '熊本': '430000',
  '大分': '440000', '宮崎': '450000', '鹿児島': '460100', '沖縄': '471000',
  '那覇': '471000',
};

const getAreaCode = (location: string): string => {
  for (const [key, code] of Object.entries(AREA_CODES)) {
    if (location.includes(key)) return code;
  }
  throw new WeatherProviderError(
    `地域「${location}」が見つかりません。日本の都道府県名を指定してください。`,
    'jma'
  );
};

const extractCondition = (weatherText: string): string => {
  if (weatherText.includes('晴')) return '晴れ';
  if (weatherText.includes('曇')) return '曇り';
  if (weatherText.includes('雨')) return '雨';
  if (weatherText.includes('雪')) return '雪';
  return weatherText.split('　')[0] || weatherText;
};

export const createJMAProvider = (config: WeatherProviderConfig): IWeatherProvider => {
  const baseUrl = 'https://www.jma.go.jp/bosai/forecast/data/forecast';

  const getCurrentWeather = async (location: string): Promise<WeatherData> => {
    const areaCode = getAreaCode(location);
    const url = `${baseUrl}/${areaCode}.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new WeatherProviderError(`JMA API error: ${response.status}`, 'jma');
    }

    const data = await response.json() as Array<{
      timeSeries: Array<{
        areas: Array<{
          area: { name: string };
          weathers?: string[];
          winds?: string[];
          temps?: string[];
        }>;
      }>;
    }>;

    const forecast = data[0];
    if (!forecast?.timeSeries?.[0]) {
      throw new WeatherProviderError('JMA APIからデータを取得できませんでした', 'jma');
    }

    const weatherArea = forecast.timeSeries[0].areas[0];
    const weatherText = weatherArea?.weathers?.[0] || '不明';

    let temperature = 0;
    const tempSeries = forecast.timeSeries.find(ts =>
      ts.areas.some(a => a.temps !== undefined)
    );
    if (tempSeries) {
      const tempArea = tempSeries.areas[0];
      const temps = tempArea.temps || [];
      temperature = temps.length > 0 ? parseInt(temps[temps.length - 1], 10) || 0 : 0;
    }

    return {
      location,
      temperature,
      condition: extractCondition(weatherText),
      humidity: 0,
      windSpeed: 0,
      fetchedAt: new Date(),
    };
  };

  const getForecast = async (location: string, _days?: number): Promise<WeatherData> => {
    return getCurrentWeather(location);
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      await getCurrentWeather('東京');
      return true;
    } catch {
      return false;
    }
  };

  return { name: 'jma' as const, getCurrentWeather, getForecast, testConnection };
};
