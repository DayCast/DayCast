/**
 * カレンダープロバイダーのファクトリーとエクスポート
 */

import type { ICalendarProvider, CalendarProviderConfig, CalendarProviderType } from './base';
import { GoogleCalendarProvider } from './google';

export * from './base';
export { GoogleCalendarProvider } from './google';

/**
 * プロバイダーのファクトリー関数
 */
export function createCalendarProvider(config: CalendarProviderConfig): ICalendarProvider {
  switch (config.type) {
    case 'google':
      return new GoogleCalendarProvider(config);
    default:
      throw new Error(`Unknown calendar provider type: ${config.type}`);
  }
}

/**
 * ユーザーごとのカレンダープロバイダーを作成
 * ユーザーのOAuthトークンを使用
 */
export async function createCalendarProviderForUser(
  userId: string
): Promise<ICalendarProvider> {
  // TODO: データベースからユーザーのOAuthトークンを取得
  // この実装はorchestrator.tsで行う
  throw new Error('Not implemented. Use createCalendarProvider directly.');
}
