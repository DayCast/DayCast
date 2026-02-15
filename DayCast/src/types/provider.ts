/**
 * プロバイダー共通の型定義
 */

import type { ToolDefinition } from './agent';
import type { WeatherData, CalendarEvent, ScrapedData, ToolResult } from './tools';

// ============================================
// AI プロバイダー
// ============================================

export type AIProviderType = 'vertexai' | 'gemini';

export type AIMessage = {
  role: 'user' | 'model' | 'system';
  content: string;
};

export type ToolCall = {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
};

export type AIResponse = {
  text: string;
  toolCalls?: ToolCall[];
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
};

export type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  tools?: ToolDefinition[];
};

export type AIProviderConfig = {
  type: AIProviderType;
  projectId?: string;
  location?: string;
  apiKey?: string;
  model?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
};

export type IAIProvider = {
  readonly name: AIProviderType;
  generate(messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse>;
  generateStream?(messages: AIMessage[], options?: GenerateOptions): AsyncGenerator<string, void, unknown>;
  clearHistory(): void;
  testConnection(): Promise<boolean>;
};

// ============================================
// Weather プロバイダー
// ============================================

export type WeatherProviderType = 'openweathermap' | 'jma';

export type WeatherProviderConfig = {
  type: WeatherProviderType;
  apiKey?: string;
  defaultLocation?: string;
};

export type WeatherOptions = {
  days?: number;
};

export type IWeatherProvider = {
  readonly name: WeatherProviderType;
  getCurrentWeather(location: string): Promise<WeatherData>;
  getForecast(location: string, days?: number): Promise<WeatherData>;
  testConnection(): Promise<boolean>;
};

// ============================================
// Calendar プロバイダー
// ============================================

export type CalendarProviderType = 'google';

export type CalendarProviderConfig = {
  type: CalendarProviderType;
  accessToken: string;
  calendarId?: string;
  timezone?: string;
};

export type CreateEventOptions = {
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  attendees?: string[];
};

export type UpdateEventOptions = {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  description?: string;
  location?: string;
};

export type SearchEventsOptions = {
  query: string;
  startDate?: Date;
  endDate?: Date;
  maxResults?: number;
};

export type FreeTimeSlot = {
  start: Date;
  end: Date;
  durationMinutes: number;
};

export type ICalendarProvider = {
  readonly name: CalendarProviderType;
  getEvents(startDate: Date, endDate: Date): Promise<ToolResult<CalendarEvent[]>>;
  createEvent(options: CreateEventOptions): Promise<ToolResult<CalendarEvent>>;
  updateEvent(eventId: string, options: UpdateEventOptions): Promise<ToolResult<CalendarEvent>>;
  deleteEvent(eventId: string): Promise<ToolResult<void>>;
  searchEvents(options: SearchEventsOptions): Promise<ToolResult<CalendarEvent[]>>;
  findFreeTime(startDate: Date, endDate: Date, durationMinutes: number): Promise<ToolResult<FreeTimeSlot[]>>;
  testConnection(): Promise<boolean>;
};

// ============================================
// Scraper
// ============================================

export type ScrapeOptions = {
  url: string;
  selector?: string;
  removeScripts?: boolean;
  removeStyles?: boolean;
  maxLength?: number;
  timeout?: number;
  userAgent?: string;
};

export type ScrapeMetadata = {
  title?: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  image?: string;
};

export type IScraper = {
  scrape(options: ScrapeOptions): Promise<ToolResult<ScrapedData>>;
  scrapeMultiple(urls: string[]): Promise<ToolResult<ScrapedData[]>>;
  getMetadata(url: string): Promise<ToolResult<ScrapeMetadata>>;
};
