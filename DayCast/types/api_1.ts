/**
 * API関連の定数
 */

// APIエンドポイント
export const API_ROUTES = {
  // Todo
  TODOS: '/api/todos',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
  
  // Agent
  AGENT_EXECUTE: '/api/agent/execute',
  AGENT_TASKS: '/api/agent/tasks',
  
  // Notification
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read`,
  
  // Settings
  SETTINGS: '/api/settings',
  
  // Webhook
  WEBHOOK: '/api/webhook',
} as const;

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// エラーコード
export const ERROR_CODES = {
  // 認証エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // リソースエラー
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // サーバーエラー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // AI関連エラー
  AI_TIMEOUT: 'AI_TIMEOUT',
  AI_RATE_LIMIT: 'AI_RATE_LIMIT',
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
} as const;

// ページネーション
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
