/**
 * AIプロバイダーの共通インターフェース
 * Vertex AI と Gemini API の両方に対応
 */

import type { ToolDefinition } from '@/types';

/**
 * AIプロバイダーの種類
 */
export type AIProviderType = 'vertexai' | 'gemini';

/**
 * AIメッセージ
 */
export interface AIMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

/**
 * ツール呼び出しリクエスト
 */
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
}

/**
 * AIレスポンス
 */
export interface AIResponse {
  text: string;                    // AIの返答テキスト
  toolCalls?: ToolCall[];          // ツール呼び出しリクエスト
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  usage?: {                        // トークン使用量
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * AI生成オプション
 */
export interface GenerateOptions {
  temperature?: number;            // 0.0-1.0（創造性）
  maxTokens?: number;              // 最大出力トークン数
  topP?: number;                   // 0.0-1.0（多様性）
  topK?: number;                   // サンプリング候補数
  stopSequences?: string[];        // 停止シーケンス
  tools?: ToolDefinition[];        // 使用可能なツール
}

/**
 * AIプロバイダーの基底インターフェース
 */
export interface IAIProvider {
  /**
   * プロバイダー名
   */
  readonly name: AIProviderType;

  /**
   * テキスト生成
   */
  generate(
    messages: AIMessage[],
    options?: GenerateOptions
  ): Promise<AIResponse>;

  /**
   * ストリーミング生成
   */
  generateStream?(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown>;

  /**
   * チャット履歴をクリア
   */
  clearHistory(): void;

  /**
   * 接続テスト
   */
  testConnection(): Promise<boolean>;
}

/**
 * プロバイダー設定
 */
export interface AIProviderConfig {
  type: AIProviderType;
  
  // Vertex AI用
  projectId?: string;
  location?: string;
  
  // Gemini API用
  apiKey?: string;
  
  // 共通設定
  model?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

/**
 * プロバイダーエラー
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProviderType,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}
