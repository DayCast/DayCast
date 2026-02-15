/**
 * AIプロバイダーのファクトリーとエクスポート
 */

import type { IAIProvider, AIProviderConfig, AIProviderType } from './base';
import { VertexAIProvider } from './vertexai';
import { GeminiProvider } from './gemini';

export * from './base';
export { VertexAIProvider } from './vertexai';
export { GeminiProvider } from './gemini';

/**
 * プロバイダーのファクトリー関数
 */
export function createAIProvider(config: AIProviderConfig): IAIProvider {
  switch (config.type) {
    case 'vertexai':
      return new VertexAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    default:
      throw new Error(`Unknown AI provider type: ${config.type}`);
  }
}

/**
 * 環境変数からプロバイダーを自動選択
 */
export function createAIProviderFromEnv(): IAIProvider {
  // 環境変数をチェック
  const providerType = (process.env.AI_PROVIDER || 'gemini') as AIProviderType;
  
  const config: AIProviderConfig = {
    type: providerType,
    model: process.env.AI_MODEL || 'gemini-2.0-flash-exp',
    defaultTemperature: process.env.AI_TEMPERATURE 
      ? parseFloat(process.env.AI_TEMPERATURE) 
      : 0.7,
    defaultMaxTokens: process.env.AI_MAX_TOKENS 
      ? parseInt(process.env.AI_MAX_TOKENS) 
      : 8192,
  };

  // Vertex AI用の設定
  if (providerType === 'vertexai') {
    config.projectId = process.env.GCP_PROJECT_ID;
    config.location = process.env.GCP_LOCATION || 'asia-northeast1';
    
    if (!config.projectId) {
      throw new Error('GCP_PROJECT_ID is required for Vertex AI');
    }
  }

  // Gemini API用の設定
  if (providerType === 'gemini') {
    config.apiKey = process.env.GEMINI_API_KEY;
    
    if (!config.apiKey) {
      throw new Error('GEMINI_API_KEY is required for Gemini API');
    }
  }

  return createAIProvider(config);
}

/**
 * シングルトンインスタンス
 * アプリ全体で1つのプロバイダーインスタンスを共有
 */
let providerInstance: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (!providerInstance) {
    providerInstance = createAIProviderFromEnv();
  }
  return providerInstance;
}

/**
 * プロバイダーインスタンスをリセット
 * テストや設定変更時に使用
 */
export function resetAIProvider(): void {
  providerInstance = null;
}
