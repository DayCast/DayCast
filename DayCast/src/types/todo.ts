/**
 * Todo関連の型定義
 */

export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

// Todoの基本情報
export type Todo = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  aiScore: number;
  aiReason?: string;
  dueDate?: Date;
  calendarEventId?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Todo作成入力
export type CreateTodoInput = {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: Date;
  calendarEventId?: string;
};

// Todo更新入力
export type UpdateTodoInput = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
};
