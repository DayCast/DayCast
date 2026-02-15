/**
 * 通知関連の型定義
 */

// 通知タイプ
export type NotificationType = 
  | 'todo_due_soon'        // Todo期限が近い
  | 'todo_overdue'         // Todo期限切れ
  | 'agent_task_complete'  // AIタスク完了
  | 'agent_task_failed'    // AIタスク失敗
  | 'system';              // システム通知

// 通知ステータス
export type NotificationStatus = 'unread' | 'read';

// 通知
export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  data?: Record<string, any>;  // 通知に紐づく追加データ
  createdAt: Date;
  readAt?: Date;
};
