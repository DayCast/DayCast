/**
 * Gemini API プロバイダー
 * class禁止: ファクトリ関数パターン
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIProvider, AIMessage, AIResponse, GenerateOptions, AIProviderConfig, ToolCall } from '@/types/provider';

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export const createGeminiProvider = (config: AIProviderConfig): IAIProvider => {
  if (!config.apiKey) {
    throw new AIProviderError('Gemini API requires apiKey', 'gemini');
  }

  const genai = new GoogleGenerativeAI(config.apiKey);
  const model = config.model || 'gemini-1.5-flash-latest';
  const defaultTemperature = config.defaultTemperature ?? 0.7;
  const defaultMaxTokens = config.defaultMaxTokens ?? 8192;

  const convertToGeminiHistory = (messages: AIMessage[]): Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }));
  };

  const handleError = (error: unknown): AIProviderError => {
    const message = error instanceof Error ? error.message : 'Unknown Gemini API error';

    if (message.includes('429') || message.includes('quota')) {
      return new AIProviderError('Gemini API rate limit exceeded. Please try again later.', 'gemini', error instanceof Error ? error : undefined);
    }
    if (message.includes('401') || message.includes('API key')) {
      return new AIProviderError('Gemini API authentication failed. Check your API key.', 'gemini', error instanceof Error ? error : undefined);
    }
    return new AIProviderError(`Gemini API error: ${message}`, 'gemini', error instanceof Error ? error : undefined);
  };

  const generate = async (messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> => {
    try {
      const generativeModel = genai.getGenerativeModel({
        model,
        generationConfig: {
          temperature: options?.temperature ?? defaultTemperature,
          maxOutputTokens: options?.maxTokens ?? defaultMaxTokens,
          topP: options?.topP,
          topK: options?.topK,
          stopSequences: options?.stopSequences,
        },
      });

      const systemInstruction = messages.find(m => m.role === 'system')?.content;
      const chatMessages = messages.filter(m => m.role !== 'system');

      const chat = generativeModel.startChat({
        systemInstruction,
        history: convertToGeminiHistory(chatMessages.slice(0, -1)),
      });

      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;

      // Function Calls抽出
      const functionCalls = response.functionCalls();
      const toolCalls: ToolCall[] | undefined = functionCalls?.map((fc, index) => ({
        id: `call_${index}`,
        name: fc.name,
        parameters: fc.args as Record<string, unknown>,
      }));

      let text = '';
      try { text = response.text(); } catch { text = ''; }

      const usageMetadata = response.usageMetadata;
      const usage = usageMetadata ? {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      } : undefined;

      let finishReason: AIResponse['finishReason'] = 'stop';
      if (toolCalls && toolCalls.length > 0) finishReason = 'tool_calls';
      else if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') finishReason = 'length';

      return { text, toolCalls, finishReason, usage };
    } catch (error) {
      throw handleError(error);
    }
  };

  const clearHistory = (): void => { /* no-op: history managed externally */ };

  const testConnection = async (): Promise<boolean> => {
    try {
      const result = await generate([{ role: 'user', content: 'Hello' }]);
      return result.text.length > 0;
    } catch { return false; }
  };

  return { name: 'gemini' as const, generate, clearHistory, testConnection };
};
