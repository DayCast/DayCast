/**
 * 通知サービス
 */

import type { Notification, NotificationType } from '@/types/notification';

const generateId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
};

export const createNotification = (input: CreateNotificationInput): Notification => {
  return {
    id: generateId(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    status: 'unread',
    data: input.data,
    createdAt: new Date(),
  };
};

export const notifyTodoDueSoon = (userId: string, todoTitle: string, dueDate: Date): Notification => {
  return createNotification({
    userId,
    type: 'todo_due_soon',
    title: `⏰ 「${todoTitle}」の期限が近づいています`,
    message: `期限: ${formatDateTime(dueDate)}`,
    data: { todoTitle, dueDate: dueDate.toISOString() },
  });
};

export const notifyTodoOverdue = (userId: string, todoTitle: string): Notification => {
  return createNotification({
    userId,
    type: 'todo_overdue',
    title: `⚠️ 「${todoTitle}」の期限が過ぎています`,
    message: 'できるだけ早く対応してください。',
    data: { todoTitle },
  });
};

export const notifyAgentTaskComplete = (userId: string, taskType: string, resultSummary: string): Notification => {
  return createNotification({
    userId,
    type: 'agent_task_complete',
    title: `✅ AIタスク完了: ${taskType}`,
    message: resultSummary,
    data: { taskType },
  });
};

export const notifyAgentTaskFailed = (userId: string, taskType: string, errorMessage: string): Notification => {
  return createNotification({
    userId,
    type: 'agent_task_failed',
    title: `❌ AIタスク失敗: ${taskType}`,
    message: errorMessage,
    data: { taskType, error: errorMessage },
  });
};

export const notifySystem = (userId: string, title: string, message: string): Notification => {
  return createNotification({ userId, type: 'system', title, message });
};

export const formatNotification = (notification: Notification): string => {
  const timeAgo = formatTimeAgo(notification.createdAt);
  return `[${notification.type}] ${notification.title} - ${notification.message} (${timeAgo})`;
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'たった今';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return formatDateTime(date);
};

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).format(date);
};

export const checkAndNotifyDueTodos = (
  userId: string,
  todos: Array<{ title: string; dueDate?: Date; status: string }>
): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  for (const todo of todos) {
    if (todo.status === 'completed' || !todo.dueDate) continue;
    const dueDate = new Date(todo.dueDate);

    if (dueDate < now) {
      notifications.push(notifyTodoOverdue(userId, todo.title));
    } else if (dueDate < tomorrow) {
      notifications.push(notifyTodoDueSoon(userId, todo.title, dueDate));
    }
  }

  return notifications;
};
