/**
 * カレンダー操作ツール
 * AIエージェントから呼び出されるメインインターフェース
 */

import type { CalendarEvent, ToolResult } from '@/types';
import type {
  ICalendarProvider,
  CreateEventOptions,
  UpdateEventOptions,
} from './calendar';

/**
 * イベント一覧を取得
 */
export async function getCalendarEvents(
  provider: ICalendarProvider,
  startDate: Date,
  endDate: Date
): Promise<ToolResult<CalendarEvent[]>> {
  try {
    const events = await provider.getEvents(startDate, endDate);
    
    return {
      success: true,
      data: events,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * イベントを作成
 */
export async function createCalendarEvent(
  provider: ICalendarProvider,
  options: CreateEventOptions
): Promise<ToolResult<CalendarEvent>> {
  try {
    const event = await provider.createEvent(options);
    
    return {
      success: true,
      data: event,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * イベントを更新
 */
export async function updateCalendarEvent(
  provider: ICalendarProvider,
  eventId: string,
  options: UpdateEventOptions
): Promise<ToolResult<CalendarEvent>> {
  try {
    const event = await provider.updateEvent(eventId, options);
    
    return {
      success: true,
      data: event,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * イベントを削除
 */
export async function deleteCalendarEvent(
  provider: ICalendarProvider,
  eventId: string
): Promise<ToolResult<void>> {
  try {
    await provider.deleteEvent(eventId);
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 空き時間を検索
 */
export async function findFreeTime(
  provider: ICalendarProvider,
  startDate: Date,
  endDate: Date,
  durationMinutes: number
): Promise<ToolResult<Array<{ start: Date; end: Date }>>> {
  try {
    const freeSlots = await provider.findFreeTime(startDate, endDate, durationMinutes);
    
    return {
      success: true,
      data: freeSlots,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * カレンダーイベントを人間が読みやすい形式でフォーマット
 */
export function formatCalendarEvents(events: CalendarEvent[]): string {
  if (events.length === 0) {
    return '📅 予定はありません';
  }

  let result = `📅 予定（${events.length}件）\n\n`;

  // 日付ごとにグループ化
  const eventsByDate = new Map<string, CalendarEvent[]>();
  
  events.forEach(event => {
    const dateKey = event.startTime.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // 日付ごとに表示
  eventsByDate.forEach((dayEvents, dateKey) => {
    result += `\n📆 ${dateKey}\n`;
    
    dayEvents.forEach(event => {
      const startTime = event.startTime.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = event.endTime.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });

      result += `  ⏰ ${startTime} - ${endTime}: ${event.title}\n`;
      
      if (event.location) {
        result += `     📍 ${event.location}\n`;
      }
      
      if (event.description) {
        // 説明が長い場合は省略
        const shortDesc = event.description.length > 50
          ? event.description.substring(0, 50) + '...'
          : event.description;
        result += `     📝 ${shortDesc}\n`;
      }
    });
  });

  return result;
}

/**
 * 空き時間を人間が読みやすい形式でフォーマット
 */
export function formatFreeTimeSlots(slots: Array<{ start: Date; end: Date }>): string {
  if (slots.length === 0) {
    return '空き時間がありません';
  }

  let result = `✨ 空き時間（${slots.length}件）\n\n`;

  slots.forEach((slot, index) => {
    const date = slot.start.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    
    const startTime = slot.start.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const endTime = slot.end.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const durationMinutes = Math.floor(
      (slot.end.getTime() - slot.start.getTime()) / (1000 * 60)
    );
    
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;
    
    let durationStr = '';
    if (durationHours > 0) {
      durationStr = `${durationHours}時間`;
      if (remainingMinutes > 0) {
        durationStr += `${remainingMinutes}分`;
      }
    } else {
      durationStr = `${remainingMinutes}分`;
    }

    result += `${index + 1}. ${date} ${startTime} - ${endTime} (${durationStr})\n`;
  });

  return result;
}

/**
 * イベント作成のサジェスト（自然言語から解析）
 */
export function parseEventFromText(text: string): Partial<CreateEventOptions> | null {
  // 簡易的な解析ロジック
  // 実際のプロダクションではより高度な自然言語処理を使用
  
  const event: Partial<CreateEventOptions> = {};

  // タイトルの抽出（「〜を」「〜の」などのパターン）
  const titleMatch = text.match(/([^\s]+?)(?:を|の|に|と|で)/);
  if (titleMatch) {
    event.title = titleMatch[1];
  }

  // 時刻の抽出
  const timeMatch = text.match(/(\d{1,2})時(?:(\d{1,2})分)?/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(hour, minute, 0, 0);
    
    // 過去の時刻なら翌日にする
    if (startTime < now) {
      startTime.setDate(startTime.getDate() + 1);
    }
    
    event.startTime = startTime;
    
    // 終了時刻（デフォルト: 1時間後）
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    event.endTime = endTime;
  }

  // 場所の抽出
  const locationMatch = text.match(/(?:で|に|at|@)\s*([^\s、。]+)/);
  if (locationMatch) {
    event.location = locationMatch[1];
  }

  return Object.keys(event).length > 0 ? event : null;
}

/**
 * 今日の予定を取得（ショートカット）
 */
export async function getTodayEvents(
  provider: ICalendarProvider
): Promise<ToolResult<CalendarEvent[]>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getCalendarEvents(provider, today, tomorrow);
}

/**
 * 明日の予定を取得（ショートカット）
 */
export async function getTomorrowEvents(
  provider: ICalendarProvider
): Promise<ToolResult<CalendarEvent[]>> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  
  return getCalendarEvents(provider, tomorrow, dayAfter);
}

/**
 * 今週の予定を取得（ショートカット）
 */
export async function getWeekEvents(
  provider: ICalendarProvider
): Promise<ToolResult<CalendarEvent[]>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return getCalendarEvents(provider, today, nextWeek);
}
