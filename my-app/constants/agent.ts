// constants/agent.ts
/**
 * AIエージェント関連の定数
 */

// エージェントタスクのステータス
export const AGENT_TASK_STATUSES = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

// ツールタイプ
export const AGENT_TOOL_TYPES = {
  WEATHER: 'weather',
  CALENDAR: 'calendar',
  SCRAPER: 'scraper',
} as const;

// AI設定
export const AI_SETTINGS = {
  // Gemini API設定
  MODEL: 'gemini-2.0-flash-exp',
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.7,
  
  // リトライ設定
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // タイムアウト設定
  TIMEOUT_MS: 30000,         // 30秒
  
  // 並列実行設定
  MAX_CONCURRENT_TASKS: 3,
} as const;

// プロンプトテンプレート
export const PROMPT_TEMPLATES = {
  SYSTEM: `あなたは優秀なAIアシスタントです。
ユーザーのタスク管理を支援し、必要に応じて以下のツールを使用できます：
- 天気情報の取得
- Googleカレンダーの操作
- Webサイトからの情報収集

常に正確で、親切で、効率的な対応を心がけてください。`,

  USER_REQUEST: (prompt: string) => 
    `ユーザーからの依頼: ${prompt}\n\n上記の依頼を分析し、必要なアクションを実行してください。`,
} as const;