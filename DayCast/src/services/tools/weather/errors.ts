/**
 * 天気プロバイダーのエラー定義
 */

export class WeatherProviderError extends Error {
  readonly provider: string;
  readonly statusCode?: number;

  constructor(message: string, provider: string, statusCode?: number) {
    super(message);
    this.name = 'WeatherProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}
