/**
 * AI プロバイダーのファクトリーとシングルトン
 *
 * 2つの取得方法:
 * - getAIProvider()          : 環境変数ベース（cron等のシステム処理用）
 * - getAIProviderForUser()   : ユーザー設定ベース（ユーザーが選んだプロバイダー）
 */

import type { IAIProvider, AIProviderConfig, AIProviderType } from '@/types/provider';
import { createGeminiProvider } from './gemini';
import { createVertexAIProvider } from './vertexai';

export { AIProviderError } from './gemini';

/**
 * 設定オブジェクトからプロバイダーを作成
 */
export const createAIProvider = (config: AIProviderConfig): IAIProvider => {
  switch (config.type) {
    case 'gemini':
      return createGeminiProvider(config);
    case 'vertexai':
      return createVertexAIProvider(config);
    default:
      throw new Error(`Unknown AI provider type: ${config.type}`);
  }
};

/**
 * 環境変数から共通設定を構築するヘルパー
 */
const buildConfig = (providerType: AIProviderType, model?: string): AIProviderConfig => {
  const config: AIProviderConfig = {
    type: providerType,
    model: model || process.env.AI_MODEL || 'gemini-1.5-flash-latest',
    defaultTemperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
    defaultMaxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 8192,
  };

  if (providerType === 'vertexai') {
    config.projectId = process.env.GCP_PROJECT_ID;
    config.location = process.env.GCP_LOCATION || 'asia-northeast1';
    if (!config.projectId) throw new Error('GCP_PROJECT_ID is required for Vertex AI');
  }
  if (providerType === 'gemini') {
    config.apiKey = process.env.GEMINI_API_KEY;
    if (!config.apiKey) throw new Error('GEMINI_API_KEY is required for Gemini API');
  }

  return config;
};

/**
 * 環境変数からデフォルトプロバイダーを作成（システム処理用）
 */
export const createAIProviderFromEnv = (): IAIProvider => {
  const providerType = (process.env.AI_PROVIDER || 'gemini') as AIProviderType;
  return createAIProvider(buildConfig(providerType));
};

/**
 * ユーザー設定からプロバイダーを作成
 * DBのUserSettingsから取得した値を渡す
 */
export const createAIProviderForUser = (userSettings: {
  aiProvider: string;
  aiModel: string;
}): IAIProvider => {
  const providerType = userSettings.aiProvider as AIProviderType;
  return createAIProvider(buildConfig(providerType, userSettings.aiModel));
};

/**
 * デフォルトのシングルトン（環境変数ベース、cron等で使用）
 */
let providerInstance: IAIProvider | null = null;

export const getAIProvider = (): IAIProvider => {
  if (!providerInstance) providerInstance = createAIProviderFromEnv();
  return providerInstance;
};

export const resetAIProvider = (): void => { providerInstance = null; };

/**
 * ユーザーごとのプロバイダーキャッシュ
 * ユーザーが設定を変更したらresetUserAIProvider()でクリア
 */
const userProviderCache = new Map<string, IAIProvider>();

export const getAIProviderForUser = (userId: string, userSettings: {
  aiProvider: string;
  aiModel: string;
}): IAIProvider => {
  const cacheKey = `${userId}_${userSettings.aiProvider}_${userSettings.aiModel}`;

  if (!userProviderCache.has(cacheKey)) {
    userProviderCache.set(cacheKey, createAIProviderForUser(userSettings));
  }

  return userProviderCache.get(cacheKey)!;
};

export const resetUserAIProvider = (userId: string): void => {
  for (const key of userProviderCache.keys()) {
    if (key.startsWith(`${userId}_`)) {
      userProviderCache.delete(key);
    }
  }
};
