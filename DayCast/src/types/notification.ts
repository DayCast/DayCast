/**
 * 通知関連の型定義
 */

export type NotificationType =
  | 'todo_due_soon'
  | 'todo_overdue'
  | 'agent_task_complete'
  | 'agent_task_failed'
  | 'system';

export type NotificationStatus = 'unread' | 'read';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  data?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
};
