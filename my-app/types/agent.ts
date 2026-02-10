// types/agent.ts
/**
 * AIエージェント関連の型定義
 */

// エージェントが使えるツールの種類
export type AgentToolType = 
  | 'weather'      // 天気情報取得
  | 'calendar'     // カレンダー操作
  | 'scraper';     // Webスクレイピング

// エージェントタスクのステータス
export type AgentTaskStatus = 
  | 'queued'       // 待機中
  | 'running'      // 実行中
  | 'success'      // 成功
  | 'failed';      // 失敗

// エージェントタスク
export type AgentTask = {
  id: string;
  userId: string;
  type: AgentToolType;
  status: AgentTaskStatus;
  input: Record<string, any>;      // ツールへの入力データ
  output?: Record<string, any>;    // ツールからの出力データ
  error?: string;                  // エラーメッセージ
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
};

// エージェント実行リクエスト
export type AgentRequest = {
  userId: string;
  prompt: string;           // ユーザーからの指示
  context?: {               // 実行コンテキスト
    todoId?: string;        // 関連するTodo
    date?: Date;            // 基準日時
  };
};

// エージェント実行結果
export type AgentResponse = {
  success: boolean;
  message: string;          // AIからの返答
  tasksExecuted: AgentTask[];
  suggestedActions?: {      // AIが提案する次のアクション
    type: string;
    description: string;
    data?: Record<string, any>;
  }[];
};

// Gemini APIへのメッセージ
export type GeminiMessage = {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
};

// ツール定義（Geminiに渡す関数定義）
export type ToolDefinition = {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
};