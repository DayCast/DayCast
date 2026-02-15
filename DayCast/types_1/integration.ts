// types/integration.ts - 外部サービス連携

/**
 * AIエージェントが使う外部サービス
 */

export type IntegrationService = 
  | 'google_calendar'
  | 'weather_api'
  | 'web_scraper';

// サービスごとの設定
export type IntegrationConfig = {
  googleCalendar: {
    calendarId: string;
    timezone: string;
  };
  weatherApi: {
    apiKey?: string;      // 無料APIなら不要かも
    location: string;
  };
  webScraper: {
    userAgent?: string;
    timeout: number;
  };
};