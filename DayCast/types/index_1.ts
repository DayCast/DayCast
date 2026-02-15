/**
 * アプリ全体で使用する定数（Todo関連）
 */

// Todo関連
export const TODO_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TODO_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// 優先度ごとの表示色
export const PRIORITY_COLORS = {
  high: '#ef4444',      // 赤
  medium: '#f59e0b',    // オレンジ
  low: '#10b981',       // 緑
} as const;

// 優先度ごとの表示ラベル
export const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
} as const;

// ステータスごとの表示ラベル
export const STATUS_LABELS = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
} as const;
