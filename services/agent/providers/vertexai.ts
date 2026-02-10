/**
 * Vertex AI (Gemini) プロバイダー実装
 */

import { VertexAI } from '@google-cloud/vertexai';
import type {
  IAIProvider,
  AIMessage,
  AIResponse,
  GenerateOptions,
  AIProviderConfig,
  AIProviderError,
  ToolCall,
} from './base';

/**
 * Vertex AI プロバイダー
 */
export class VertexAIProvider implements IAIProvider {
  readonly name = 'vertexai' as const;
  
  private vertexai: VertexAI;
  private model: string;
  private chatHistory: AIMessage[] = [];
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor(config: AIProviderConfig) {
    if (!config.projectId || !config.location) {
      throw new Error('Vertex AI requires projectId and location');
    }

    this.vertexai = new VertexAI({
      project: config.projectId,
      location: config.location,
    });

    this.model = config.model || 'gemini-2.0-flash-exp';
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
    this.defaultMaxTokens = config.defaultMaxTokens ?? 8192;
  }

  /**
   * テキスト生成
   */
  async generate(
    messages: AIMessage[],
    options?: GenerateOptions
  ): Promise<AIResponse> {
    try {
      const generativeModel = this.vertexai.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: options?.temperature ?? this.defaultTemperature,
          maxOutputTokens: options?.maxTokens ?? this.defaultMaxTokens,
          topP: options?.topP,
          topK: options?.topK,
          stopSequences: options?.stopSequences,
        },
      });

      // システムプロンプトを分離
      const systemInstruction = messages.find(m => m.role === 'system')?.content;
      const chatMessages = messages.filter(m => m.role !== 'system');

      // チャットセッション開始
      const chat = generativeModel.startChat({
        systemInstruction,
        history: this.convertToVertexHistory(chatMessages.slice(0, -1)),
      });

      // Function Calling対応
      let tools = undefined;
      if (options?.tools && options.tools.length > 0) {
        tools = [{
          functionDeclarations: options.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
        }];
      }

      // 最後のメッセージを送信
      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessage(
        lastMessage.content,
        tools ? { tools } : undefined
      );

      const response = result.response;
      
      // Function Callsの抽出
      const functionCalls = response.functionCalls();
      const toolCalls: ToolCall[] | undefined = functionCalls?.map((fc, index) => ({
        id: `call_${index}`,
        name: fc.name,
        parameters: fc.args,
      }));

      // テキストの取得
      let text = '';
      try {
        text = response.text();
      } catch (error) {
        // Function Callsのみの場合、テキストは空
        text = '';
      }

      // 使用量の取得
      const usageMetadata = response.usageMetadata;
      const usage = usageMetadata ? {
        inputTokens: usageMetadata.promptTokenCount || 0,
        outputTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      } : undefined;

      // 終了理由の判定
      let finishReason: AIResponse['finishReason'] = 'stop';
      if (toolCalls && toolCalls.length > 0) {
        finishReason = 'tool_calls';
      } else if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
        finishReason = 'length';
      }

      return {
        text,
        toolCalls,
        finishReason,
        usage,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * ストリーミング生成
   */
  async *generateStream(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      const generativeModel = this.vertexai.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: options?.temperature ?? this.defaultTemperature,
          maxOutputTokens: options?.maxTokens ?? this.defaultMaxTokens,
          topP: options?.topP,
          topK: options?.topK,
        },
      });

      const systemInstruction = messages.find(m => m.role === 'system')?.content;
      const chatMessages = messages.filter(m => m.role !== 'system');

      const chat = generativeModel.startChat({
        systemInstruction,
        history: this.convertToVertexHistory(chatMessages.slice(0, -1)),
      });

      const lastMessage = chatMessages[chatMessages.length - 1];
      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * チャット履歴をクリア
   */
  clearHistory(): void {
    this.chatHistory = [];
  }

  /**
   * 接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generate([
        { role: 'user', content: 'Hello' },
      ]);
      return result.text.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * メッセージ履歴をVertex AI形式に変換
   */
  private convertToVertexHistory(messages: AIMessage[]): Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any): AIProviderError {
    const message = error?.message || 'Unknown Vertex AI error';
    
    // レート制限エラー
    if (message.includes('429') || message.includes('quota')) {
      return {
        name: 'AIProviderError',
        message: 'Vertex AI rate limit exceeded. Please try again later.',
        provider: 'vertexai',
        originalError: error,
      } as AIProviderError;
    }

    // 認証エラー
    if (message.includes('401') || message.includes('authentication')) {
      return {
        name: 'AIProviderError',
        message: 'Vertex AI authentication failed. Check your credentials.',
        provider: 'vertexai',
        originalError: error,
      } as AIProviderError;
    }

    // その他のエラー
    return {
      name: 'AIProviderError',
      message: `Vertex AI error: ${message}`,
      provider: 'vertexai',
      originalError: error,
    } as AIProviderError;
  }
}
