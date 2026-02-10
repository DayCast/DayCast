/**
 * 通知関連の定数
 */

export const NOTIFICATION_TYPES = {
  TODO_DUE_SOON: 'todo_due_soon',
  TODO_OVERDUE: 'todo_overdue',
  AGENT_TASK_COMPLETE: 'agent_task_complete',
  AGENT_TASK_FAILED: 'agent_task_failed',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_STATUSES = {
  UNREAD: 'unread',
  READ: 'read',
} as const;

// 通知タイプごとの表示設定
export const NOTIFICATION_CONFIG = {
  todo_due_soon: {
    icon: '⏰',
    color: '#f59e0b',
    title: 'タスク期限が近づいています',
  },
  todo_overdue: {
    icon: '🔴',
    color: '#ef4444',
    title: 'タスクが期限切れです',
  },
  agent_task_complete: {
    icon: '✅',
    color: '#10b981',
    title: 'AIタスクが完了しました',
  },
  agent_task_failed: {
    icon: '❌',
    color: '#ef4444',
    title: 'AIタスクが失敗しました',
  },
  system: {
    icon: 'ℹ️',
    color: '#3b82f6',
    title: 'システム通知',
  },
} as const;
