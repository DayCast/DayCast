/**
 * Google Calendar プロバイダー実装
 * https://developers.google.com/calendar/api/v3/reference
 */

import type { CalendarEvent } from '@/types';
import type {
  ICalendarProvider,
  CalendarProviderConfig,
  CreateEventOptions,
  UpdateEventOptions,
  SearchEventsOptions,
  CalendarProviderError,
} from './base';

/**
 * Google Calendar API レスポンス型
 */
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: string;
  }>;
}

interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

/**
 * Google Calendar プロバイダー
 */
export class GoogleCalendarProvider implements ICalendarProvider {
  readonly name = 'google' as const;
  
  private accessToken: string;
  private refreshToken?: string;
  private calendarId: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(config: CalendarProviderConfig) {
    if (!config.accessToken) {
      throw new Error('Google Calendar requires accessToken');
    }
    
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.calendarId = config.calendarId || 'primary';
  }

  /**
   * イベント一覧を取得
   */
  async getEvents(
    startDate: Date,
    endDate: Date,
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const url = `${this.baseUrl}/calendars/${this.calendarId}/events?${params}`;
      const response = await this.fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GoogleCalendarListResponse = await response.json();
      
      return data.items.map(item => this.convertToCalendarEvent(item));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * イベントを作成
   */
  async createEvent(options: CreateEventOptions): Promise<CalendarEvent> {
    try {
      const requestBody = {
        summary: options.title,
        description: options.description,
        location: options.location,
        start: {
          dateTime: options.startTime.toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: options.endTime.toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        attendees: options.attendees?.map(email => ({ email })),
        reminders: options.reminders || {
          useDefault: true,
        },
      };

      const url = `${this.baseUrl}/calendars/${this.calendarId}/events`;
      const response = await this.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GoogleCalendarEvent = await response.json();
      
      return this.convertToCalendarEvent(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * イベントを更新
   */
  async updateEvent(
    eventId: string,
    options: UpdateEventOptions
  ): Promise<CalendarEvent> {
    try {
      // まず既存のイベントを取得
      const getUrl = `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`;
      const getResponse = await this.fetch(getUrl);

      if (!getResponse.ok) {
        throw new Error(`Failed to fetch event: ${getResponse.status}`);
      }

      const existingEvent: GoogleCalendarEvent = await getResponse.json();

      // 更新データをマージ
      const requestBody = {
        summary: options.title || existingEvent.summary,
        description: options.description ?? existingEvent.description,
        location: options.location ?? existingEvent.location,
        start: options.startTime
          ? { dateTime: options.startTime.toISOString(), timeZone: 'Asia/Tokyo' }
          : existingEvent.start,
        end: options.endTime
          ? { dateTime: options.endTime.toISOString(), timeZone: 'Asia/Tokyo' }
          : existingEvent.end,
        attendees: options.attendees
          ? options.attendees.map(email => ({ email }))
          : existingEvent.attendees,
      };

      const updateUrl = `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`;
      const response = await this.fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GoogleCalendarEvent = await response.json();
      
      return this.convertToCalendarEvent(data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * イベントを削除
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/calendars/${this.calendarId}/events/${eventId}`;
      const response = await this.fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * イベントを検索
   */
  async searchEvents(options: SearchEventsOptions): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: options.startDate.toISOString(),
        timeMax: options.endDate.toISOString(),
        maxResults: (options.maxResults || 50).toString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      if (options.query) {
        params.append('q', options.query);
      }

      const url = `${this.baseUrl}/calendars/${this.calendarId}/events?${params}`;
      const response = await this.fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: GoogleCalendarListResponse = await response.json();
      
      return data.items.map(item => this.convertToCalendarEvent(item));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 空き時間を検索
   */
  async findFreeTime(
    startDate: Date,
    endDate: Date,
    durationMinutes: number
  ): Promise<Array<{ start: Date; end: Date }>> {
    try {
      // イベント一覧を取得
      const events = await this.getEvents(startDate, endDate);

      // イベントを時系列でソート
      events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      const freeSlots: Array<{ start: Date; end: Date }> = [];
      let currentTime = new Date(startDate);

      for (const event of events) {
        const eventStart = new Date(event.startTime);
        
        // 現在時刻とイベント開始時刻の間に空き時間があるか確認
        const gapMinutes = (eventStart.getTime() - currentTime.getTime()) / (1000 * 60);
        
        if (gapMinutes >= durationMinutes) {
          freeSlots.push({
            start: new Date(currentTime),
            end: new Date(eventStart),
          });
        }

        // 現在時刻をイベント終了時刻に更新
        currentTime = new Date(Math.max(
          currentTime.getTime(),
          event.endTime.getTime()
        ));
      }

      // 最後のイベント後から終了時刻までの空き時間をチェック
      const remainingMinutes = (endDate.getTime() - currentTime.getTime()) / (1000 * 60);
      if (remainingMinutes >= durationMinutes) {
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(endDate),
        });
      }

      return freeSlots;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/calendars/${this.calendarId}`;
      const response = await this.fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Google Calendar イベントを共通形式に変換
   */
  private convertToCalendarEvent(event: GoogleCalendarEvent): CalendarEvent {
    const startTime = event.start.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start.date!);
    
    const endTime = event.end.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end.date!);

    return {
      id: event.id,
      title: event.summary,
      description: event.description,
      startTime,
      endTime,
      location: event.location,
      attendees: event.attendees?.map(a => a.email),
    };
  }

  /**
   * 認証付きfetch
   */
  private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${this.accessToken}`);

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any): CalendarProviderError {
    const message = error?.message || 'Unknown Google Calendar error';
    
    // 認証エラー
    if (message.includes('401') || message.includes('authentication')) {
      return {
        name: 'CalendarProviderError',
        message: 'Google Calendar authentication failed. Please re-authenticate.',
        provider: 'google',
        originalError: error,
      } as CalendarProviderError;
    }

    // アクセス権限エラー
    if (message.includes('403') || message.includes('forbidden')) {
      return {
        name: 'CalendarProviderError',
        message: 'Access to Google Calendar denied. Check permissions.',
        provider: 'google',
        originalError: error,
      } as CalendarProviderError;
    }

    // レート制限エラー
    if (message.includes('429')) {
      return {
        name: 'CalendarProviderError',
        message: 'Google Calendar rate limit exceeded. Please try again later.',
        provider: 'google',
        originalError: error,
      } as CalendarProviderError;
    }

    // イベントが見つからない
    if (message.includes('404')) {
      return {
        name: 'CalendarProviderError',
        message: 'Event not found',
        provider: 'google',
        originalError: error,
      } as CalendarProviderError;
    }

    // その他のエラー
    return {
      name: 'CalendarProviderError',
      message: `Google Calendar error: ${message}`,
      provider: 'google',
      originalError: error,
    } as CalendarProviderError;
  }
}
