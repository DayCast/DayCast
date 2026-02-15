/**
 * Vertex AI プロバイダー
 * class禁止: ファクトリ関数パターン
 */

import { VertexAI } from '@google-cloud/vertexai';
import type { IAIProvider, AIMessage, AIResponse, GenerateOptions, AIProviderConfig, ToolCall } from '@/types/provider';
import { AIProviderError } from './gemini';

export const createVertexAIProvider = (config: AIProviderConfig): IAIProvider => {
  if (!config.projectId || !config.location) {
    throw new AIProviderError('Vertex AI requires projectId and location', 'vertexai');
  }

  const vertexai = new VertexAI({ project: config.projectId, location: config.location });
  const model = config.model || 'gemini-1.5-flash-latest';
  const defaultTemperature = config.defaultTemperature ?? 0.7;
  const defaultMaxTokens = config.defaultMaxTokens ?? 8192;

  const convertToVertexHistory = (messages: AIMessage[]): Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.content }],
    }));
  };

  const handleError = (error: unknown): AIProviderError => {
    const message = error instanceof Error ? error.message : 'Unknown Vertex AI error';
    if (message.includes('429') || message.includes('quota')) {
      return new AIProviderError('Vertex AI rate limit exceeded.', 'vertexai', error instanceof Error ? error : undefined);
    }
    if (message.includes('401') || message.includes('authentication')) {
      return new AIProviderError('Vertex AI authentication failed.', 'vertexai', error instanceof Error ? error : undefined);
    }
    return new AIProviderError(`Vertex AI error: ${message}`, 'vertexai', error instanceof Error ? error : undefined);
  };

  const generate = async (messages: AIMessage[], options?: GenerateOptions): Promise<AIResponse> => {
    try {
      const generativeModel = vertexai.getGenerativeModel({
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
        history: convertToVertexHistory(chatMessages.slice(0, -1)),
      });

      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;

      // Extract function calls from response candidates
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const functionCallParts = parts.filter((part): part is { functionCall: { name: string; args: Record<string, unknown> } } => 
        'functionCall' in part && part.functionCall !== undefined
      );
      const toolCalls: ToolCall[] | undefined = functionCallParts.length > 0 
        ? functionCallParts.map((fc, index) => ({
            id: `call_${index}`,
            name: fc.functionCall.name,
            parameters: fc.functionCall.args as Record<string, unknown>,
          }))
        : undefined;

      let text = '';
      try { 
        const textParts = parts.filter((part): part is { text: string } => 'text' in part && typeof part.text === 'string');
        text = textParts.map(p => p.text).join('');
      } catch { text = ''; }

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

  const clearHistory = (): void => {};
  const testConnection = async (): Promise<boolean> => {
    try {
      const result = await generate([{ role: 'user', content: 'Hello' }]);
      return result.text.length > 0;
    } catch { return false; }
  };

  return { name: 'vertexai' as const, generate, clearHistory, testConnection };
};
