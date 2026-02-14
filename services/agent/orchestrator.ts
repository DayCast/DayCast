/**
 * AIエージェントのオーケストレーター
 * 全てのツールとAIプロバイダーを統合し、ユーザーリクエストを処理
 */

import type { AgentRequest, AgentResponse, AgentTask, AgentToolType } from '@/types';
import { getAIProvider } from './providers';
import type { IAIProvider, AIMessage, ToolCall } from './providers/base';
import { SYSTEM_PROMPT, createUserPrompt, createToolResultPrompt, TOOL_DEFINITIONS } from './prompts';

// ツールのインポート
import { getCurrentWeather, getWeatherForecast } from '../tools/weather';
import { createCalendarProvider } from '../tools/calendar';
import type { ICalendarProvider } from '../tools/calendar/base';
import {
  getCalendarEvents,
  createCalendarEvent,
  getTodayEvents,
  getTomorrowEvents,
} from '../tools/calendar';
import { scrapeWebsite, getWebsiteMetadata } from '../tools/scraper';

/**
 * AIエージェントのオーケストレーター
 */
export class AgentOrchestrator {
  private aiProvider: IAIProvider;
  private conversationHistory: AIMessage[] = [];

  constructor() {
    this.aiProvider = getAIProvider();
  }

  /**
   * ユーザーリクエストを処理
   */
  async execute(request: AgentRequest): Promise<AgentResponse> {
    try {
      // システムプロンプトを設定
      const messages: AIMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];

      // 会話履歴を追加
      messages.push(...this.conversationHistory);

      // ユーザープロンプトを作成
      const userPrompt = createUserPrompt(request.prompt, {
        currentDate: request.context?.date,
      });
      messages.push({ role: 'user', content: userPrompt });

      // AIにリクエスト（Function Calling有効）
      const response = await this.aiProvider.generate(messages, {
        tools: TOOL_DEFINITIONS,
      });

      // タスク実行リスト
      const tasksExecuted: AgentTask[] = [];

      // ツール呼び出しがある場合
      if (response.toolCalls && response.toolCalls.length > 0) {
        // 各ツールを実行
        for (const toolCall of response.toolCalls) {
          const task = await this.executeToolCall(request.userId, toolCall, request);
          tasksExecuted.push(task);

          // ツール実行結果をAIに返す
          const toolResultPrompt = createToolResultPrompt(
            this.mapToolNameToType(toolCall.name),
            task.output,
            task.error || undefined
          );
          messages.push({ role: 'user', content: toolResultPrompt });
        }

        // ツール実行結果を基に最終的な返答を生成
        const finalResponse = await this.aiProvider.generate(messages);
        
        return {
          success: true,
          message: finalResponse.text,
          tasksExecuted,
        };
      }

      // ツール呼び出しがない場合は直接返答
      return {
        success: true,
        message: response.text,
        tasksExecuted: [],
      };
    } catch (error) {
      return {
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        tasksExecuted: [],
      };
    }
  }

  /**
   * ツール呼び出しを実行
   */
  private async executeToolCall(
    userId: string,
    toolCall: ToolCall,
    request: AgentRequest
  ): Promise<AgentTask> {
    const task: AgentTask = {
      id: toolCall.id,
      userId,
      type: this.mapToolNameToType(toolCall.name),
      status: 'running',
      input: toolCall.parameters,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    try {
      let output: any;

      switch (toolCall.name) {
        case 'get_weather':
          output = await this.executeWeatherTool(toolCall.parameters);
          break;

        case 'get_calendar_events':
          output = await this.executeGetCalendarTool(userId, toolCall.parameters);
          break;

        case 'create_calendar_event':
          output = await this.executeCreateCalendarTool(userId, toolCall.parameters);
          break;

        case 'scrape_website':
          output = await this.executeScraperTool(toolCall.parameters);
          break;

        default:
          throw new Error(`Unknown tool: ${toolCall.name}`);
      }

      task.status = 'success';
      task.output = output;
      task.completedAt = new Date();
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
    }

    return task;
  }

  /**
   * 天気ツールを実行
   */
  private async executeWeatherTool(params: Record<string, any>): Promise<any> {
    const { location, date } = params;

    if (date) {
      // 予報を取得
      const result = await getWeatherForecast(location, 5);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } else {
      // 現在の天気を取得
      const result = await getCurrentWeather(location);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    }
  }

  /**
   * カレンダー取得ツールを実行
   */
  private async executeGetCalendarTool(
    userId: string,
    params: Record<string, any>
  ): Promise<any> {
    const calendar = await this.getCalendarProvider(userId);
    
    const { startDate, endDate } = params;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(end.getDate() + 1);

    const result = await getCalendarEvents(calendar, start, end);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  }

  /**
   * カレンダー作成ツールを実行
   */
  private async executeCreateCalendarTool(
    userId: string,
    params: Record<string, any>
  ): Promise<any> {
    const calendar = await this.getCalendarProvider(userId);
    
    const { title, startTime, endTime, description, location } = params;
    
    const result = await createCalendarEvent(calendar, {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description,
      location,
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  }

  /**
   * スクレイパーツールを実行
   */
  private async executeScraperTool(params: Record<string, any>): Promise<any> {
    const { url, selector } = params;
    
    const result = await scrapeWebsite(url, selector);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.data;
  }

  /**
   * カレンダープロバイダーを取得（ユーザーごと）
   */
  private async getCalendarProvider(userId: string): Promise<ICalendarProvider> {
    // TODO: データベースからユーザーのOAuthトークンを取得
    // 今は環境変数から取得（デモ用）
    
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('Google Calendar is not connected. Please connect your calendar first.');
    }

    return createCalendarProvider({
      type: 'google',
      accessToken,
      calendarId: 'primary',
    });
  }

  /**
   * ツール名を AgentToolType にマッピング
   */
  private mapToolNameToType(toolName: string): AgentToolType {
    if (toolName.includes('weather')) return 'weather';
    if (toolName.includes('calendar')) return 'calendar';
    if (toolName.includes('scrape')) return 'scraper';
    return 'weather'; // デフォルト
  }

  /**
   * 会話履歴をクリア
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 会話履歴を追加
   */
  addToHistory(role: 'user' | 'model', content: string): void {
    this.conversationHistory.push({ role, content });
  }
}

/**
 * シングルトンインスタンス
 */
let orchestratorInstance: AgentOrchestrator | null = null;

/**
 * オーケストレーターインスタンスを取得
 */
export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}

/**
 * オーケストレーターインスタンスをリセット
 */
export function resetOrchestrator(): void {
  orchestratorInstance = null;
}
