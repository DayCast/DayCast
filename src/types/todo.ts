export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  deadline?: Date;
  userId: string;
  createdAt: Date;
  
  // UI表示やAI連携で使いそうな追加項目
  aiAdvice?: string;        // AIからの理由
  isAiGenerated: boolean;  // AI生成フラグ
}