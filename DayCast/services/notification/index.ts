/**
 * 通知ロジック
 * Todoの期限やAIタスクの完了を通知
 */

import type {
  Notification,
  NotificationType,
  Todo,
  AgentTask,
} from '@/types';
import { NOTIFICATION_CONFIG } from '@/constants/notification';

/**
 * 通知作成オプション
 */
export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * 通知を作成
 */
export async function createNotification(
  options: CreateNotificationOptions
): Promise<Notification> {
  // TODO: データベースに保存
  // 今はオブジェクトを返すだけ（デモ用）
  
  const notification: Notification = {
    id: generateId(),
    userId: options.userId,
    type: options.type,
    title: options.title,
    message: options.message,
    status: 'unread',
    data: options.data,
    createdAt: new Date(),
  };

  return notification;
}

/**
 * Todo期限通知を作成
 */
export async function notifyTodoDueSoon(
  todo: Todo
): Promise<Notification> {
  const config = NOTIFICATION_CONFIG.todo_due_soon;
  
  const hoursUntilDue = todo.dueDate
    ? Math.floor((todo.dueDate.getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  let message = `タスク「${todo.title}」の期限が近づいています。`;
  
  if (hoursUntilDue <= 1) {
    message += ' あと1時間以内です！';
  } else if (hoursUntilDue <= 24) {
    message += ` あと${hoursUntilDue}時間です。`;
  } else {
    const days = Math.floor(hoursUntilDue / 24);
    message += ` あと${days}日です。`;
  }

  return createNotification({
    userId: todo.userId,
    type: 'todo_due_soon',
    title: config.title,
    message,
    data: {
      todoId: todo.id,
      dueDate: todo.dueDate?.toISOString(),
    },
  });
}

/**
 * Todo期限切れ通知を作成
 */
export async function notifyTodoOverdue(
  todo: Todo
): Promise<Notification> {
  const config = NOTIFICATION_CONFIG.todo_overdue;
  
  const hoursOverdue = todo.dueDate
    ? Math.floor((Date.now() - todo.dueDate.getTime()) / (1000 * 60 * 60))
    : 0;

  let message = `タスク「${todo.title}」が期限を過ぎています。`;
  
  if (hoursOverdue <= 24) {
    message += ` ${hoursOverdue}時間前に期限でした。`;
  } else {
    const days = Math.floor(hoursOverdue / 24);
    message += ` ${days}日前に期限でした。`;
  }

  return createNotification({
    userId: todo.userId,
    type: 'todo_overdue',
    title: config.title,
    message,
    data: {
      todoId: todo.id,
      dueDate: todo.dueDate?.toISOString(),
    },
  });
}

/**
 * AIタスク完了通知を作成
 */
export async function notifyAgentTaskComplete(
  task: AgentTask,
  summary: string
): Promise<Notification> {
  const config = NOTIFICATION_CONFIG.agent_task_complete;
  
  const taskNames: Record<string, string> = {
    weather: '天気情報取得',
    calendar: 'カレンダー操作',
    scraper: 'Web情報収集',
  };

  const message = `${taskNames[task.type] || task.type}が完了しました。${summary}`;

  return createNotification({
    userId: task.userId,
    type: 'agent_task_complete',
    title: config.title,
    message,
    data: {
      taskId: task.id,
      taskType: task.type,
      output: task.output,
    },
  });
}

/**
 * AIタスク失敗通知を作成
 */
export async function notifyAgentTaskFailed(
  task: AgentTask
): Promise<Notification> {
  const config = NOTIFICATION_CONFIG.agent_task_failed;
  
  const taskNames: Record<string, string> = {
    weather: '天気情報取得',
    calendar: 'カレンダー操作',
    scraper: 'Web情報収集',
  };

  const message = `${taskNames[task.type] || task.type}に失敗しました。${task.error || 'エラーが発生しました'}`;

  return createNotification({
    userId: task.userId,
    type: 'agent_task_failed',
    title: config.title,
    message,
    data: {
      taskId: task.id,
      taskType: task.type,
      error: task.error,
    },
  });
}

/**
 * システム通知を作成
 */
export async function notifySystem(
  userId: string,
  message: string
): Promise<Notification> {
  const config = NOTIFICATION_CONFIG.system;
  
  return createNotification({
    userId,
    type: 'system',
    title: config.title,
    message,
  });
}

/**
 * 期限が近いTodoをチェックして通知
 */
export async function checkAndNotifyDueTodos(
  todos: Todo[]
): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const now = new Date();

  for (const todo of todos) {
    // 完了済みはスキップ
    if (todo.status === 'completed') continue;
    
    // 期限がないものはスキップ
    if (!todo.dueDate) continue;

    const hoursUntilDue = (todo.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // 期限切れ
    if (hoursUntilDue < 0) {
      const notification = await notifyTodoOverdue(todo);
      notifications.push(notification);
    }
    // 24時間以内
    else if (hoursUntilDue <= 24) {
      const notification = await notifyTodoDueSoon(todo);
      notifications.push(notification);
    }
  }

  return notifications;
}

/**
 * 通知をフォーマット（UI表示用）
 */
export function formatNotification(notification: Notification): string {
  const config = NOTIFICATION_CONFIG[notification.type];
  const icon = config?.icon || 'ℹ️';
  
  const timeStr = formatTimeAgo(notification.createdAt);
  
  return `${icon} ${notification.title}\n${notification.message}\n（${timeStr}）`;
}

/**
 * 相対時間表示
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'たった今';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}分前`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}時間前`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}日前`;
  }

  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * IDを生成（仮実装）
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
