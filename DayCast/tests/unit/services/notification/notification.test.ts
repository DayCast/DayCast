/**
 * Notification サービスのテスト
 */
import { describe, it, expect } from 'vitest';

describe('Notification Service', () => {
  it('createNotification が正しい通知オブジェクトを返す', async () => {
    const { createNotification } = await import('@/services/notification/index');

    const notification = createNotification({
      userId: 'user-1',
      type: 'system',
      title: 'テスト通知',
      message: 'これはテスト通知です',
    });

    expect(notification.userId).toBe('user-1');
    expect(notification.type).toBe('system');
    expect(notification.title).toBe('テスト通知');
    expect(notification.message).toBe('これはテスト通知です');
    expect(notification.status).toBe('unread');
    expect(notification.id).toBeDefined();
    expect(notification.createdAt).toBeInstanceOf(Date);
  });

  it('notifyTodoDueSoon が正しい通知を作成する', async () => {
    const { notifyTodoDueSoon } = await import('@/services/notification/index');

    const notification = notifyTodoDueSoon(
      'user-1',
      'タスクA',
      new Date('2026-02-11T10:00:00')
    );

    expect(notification.type).toBe('todo_due_soon');
    expect(notification.title).toContain('タスクA');
  });

  it('notifyTodoOverdue が正しい通知を作成する', async () => {
    const { notifyTodoOverdue } = await import('@/services/notification/index');

    const notification = notifyTodoOverdue('user-1', 'タスクB');

    expect(notification.type).toBe('todo_overdue');
    expect(notification.title).toContain('タスクB');
  });

  it('notifyAgentTaskComplete が正しい通知を作成する', async () => {
    const { notifyAgentTaskComplete } = await import('@/services/notification/index');

    const notification = notifyAgentTaskComplete('user-1', 'weather', '天気情報取得完了');

    expect(notification.type).toBe('agent_task_complete');
  });

  it('formatNotification が表示用文字列を返す', async () => {
    const { createNotification, formatNotification } = await import('@/services/notification/index');

    const notification = createNotification({
      userId: 'user-1',
      type: 'system',
      title: 'テスト',
      message: 'メッセージ',
    });

    const formatted = formatNotification(notification);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('formatTimeAgo が相対時刻を返す', async () => {
    const { formatTimeAgo } = await import('@/services/notification/index');

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const result = formatTimeAgo(fiveMinutesAgo);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
