// types/todo.ts
/**
 * Todo関連の型定義
 */

// Todo優先度（高・中・低）
export type TodoPriority = 'high' | 'medium' | 'low';

// Todoステータス（保留中・進行中・完了）
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

// Todoの基本型
export type Todo = {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: Date;
  completedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Todo作成時の入力型（IDや日時は自動生成されるので不要）
export type CreateTodoInput = {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: Date;
};

// Todo更新時の入力型（全項目オプショナル）
export type UpdateTodoInput = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
};