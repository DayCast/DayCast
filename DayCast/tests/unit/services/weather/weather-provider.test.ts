/**
 * Weather プロバイダーのテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// モック: fetch をグローバルでモック
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('JMA Weather Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createJMAProvider がIWeatherProviderを返す', async () => {
    const { createJMAProvider } = await import('@/services/tools/weather/jma');
    const provider = createJMAProvider({ type: 'jma' });

    expect(provider.name).toBe('jma');
    expect(typeof provider.getCurrentWeather).toBe('function');
    expect(typeof provider.getForecast).toBe('function');
    expect(typeof provider.testConnection).toBe('function');
  });

  it('getCurrentWeather が東京の天気を取得できる', async () => {
    const jmaResponse = [
      {
        publishingOffice: '気象庁',
        reportDatetime: '2026-02-10T11:00:00+09:00',
        timeSeries: [
          {
            timeDefines: ['2026-02-10T11:00:00+09:00'],
            areas: [
              {
                area: { name: '東京地方' },
                weathers: ['晴れ'],
                winds: ['北の風'],
              },
            ],
          },
          {
            timeDefines: ['2026-02-10T09:00:00+09:00'],
            areas: [
              {
                area: { name: '東京地方' },
                temps: ['5', '12'],
              },
            ],
          },
        ],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(jmaResponse),
    });

    const { createJMAProvider } = await import('@/services/tools/weather/jma');
    const provider = createJMAProvider({ type: 'jma' });
    const result = await provider.getCurrentWeather('東京');

    expect(result.location).toBe('東京');
    expect(result.condition).toBe('晴れ');
    expect(typeof result.temperature).toBe('number');
  });

  it('不明な地域でエラーを投げる', async () => {
    const { createJMAProvider } = await import('@/services/tools/weather/jma');
    const provider = createJMAProvider({ type: 'jma' });

    await expect(provider.getCurrentWeather('ニューヨーク')).rejects.toThrow();
  });
});

describe('Weather Provider (JMA固定)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getWeatherProvider がJMAプロバイダーを返す', async () => {
    const { getWeatherProvider, resetWeatherProvider } = await import('@/services/tools/weather/index');
    resetWeatherProvider();
    const provider = getWeatherProvider();
    expect(provider.name).toBe('jma');
  });

  it('シングルトンが同じインスタンスを返す', async () => {
    const { getWeatherProvider, resetWeatherProvider } = await import('@/services/tools/weather/index');
    resetWeatherProvider();
    const p1 = getWeatherProvider();
    const p2 = getWeatherProvider();
    expect(p1).toBe(p2);
  });
});
