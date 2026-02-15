/**
 * AIエージェントのオーケストレーター
 * class禁止: ファクトリ関数パターン
 */

import type { AgentRequest, AgentResponse, AgentTask, AgentToolType } from '@/types/agent';
import type { AIMessage, IAIProvider, ToolCall } from '@/types/provider';
import { getAIProvider, getAIProviderForUser } from '@/services/ai/index';
import { SYSTEM_PROMPT, createUserPrompt, createToolResultPrompt, TOOL_DEFINITIONS } from './prompts';
import { getCurrentWeather, getWeatherForecast } from '@/services/tools/weather/weather-tools';
import { scrapeWebsite } from '@/services/tools/scraper/scraper-tools';

/**
 * ユーザー設定（DBから取得してオーケストレーターに渡す）
 */
export type OrchestratorUserSettings = {
  aiProvider: string;
  aiModel: string;
};

const mapToolNameToType = (toolName: string): AgentToolType => {
  if (toolName.includes('weather')) return 'weather';
  if (toolName.includes('calendar')) return 'calendar';
  if (toolName.includes('scrape')) return 'scraper';
  return 'weather';
};

/**
 * オーケストレーター作成
 * userSettings を渡すとユーザーが選んだAIプロバイダーを使う
 * 渡さなければ環境変数のデフォルトを使う
 */
export const createOrchestrator = (userId?: string, userSettings?: OrchestratorUserSettings) => {
  const aiProvider: IAIProvider = (userId && userSettings)
    ? getAIProviderForUser(userId, userSettings)
    : getAIProvider();
  let conversationHistory: AIMessage[] = [];

  const executeWeatherTool = async (params: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const location = params.location as string;
    const date = params.date as string | undefined;

    if (date) {
      const result = await getWeatherForecast(location, 5);
      if (!result.success) throw new Error(result.error);
      return result.data as unknown as Record<string, unknown>;
    }
    const result = await getCurrentWeather(location);
    if (!result.success) throw new Error(result.error);
    return result.data as unknown as Record<string, unknown>;
  };

  const executeScraperTool = async (params: Record<string, unknown>): Promise<Record<string, unknown>> => {
    const url = params.url as string;
    const selector = params.selector as string | undefined;
    const result = await scrapeWebsite(url, selector);
    if (!result.success) throw new Error(result.error);
    return result.data as unknown as Record<string, unknown>;
  };

  const executeToolCall = async (
    userId: string,
    toolCall: ToolCall
  ): Promise<AgentTask> => {
    const task: AgentTask = {
      id: toolCall.id,
      userId,
      type: mapToolNameToType(toolCall.name),
      status: 'running',
      input: toolCall.parameters,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    try {
      let output: Record<string, unknown>;

      switch (toolCall.name) {
        case 'get_weather':
          output = await executeWeatherTool(toolCall.parameters);
          break;
        case 'scrape_website':
          output = await executeScraperTool(toolCall.parameters);
          break;
        case 'get_calendar_events':
        case 'create_calendar_event':
          // TODO: Calendar integration requires user OAuth token
          throw new Error('カレンダー機能はOAuth連携後に利用可能になります');
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
  };

  const execute = async (request: AgentRequest): Promise<AgentResponse> => {
    try {
      const messages: AIMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory,
      ];

      const userPrompt = createUserPrompt(request.prompt, {
        currentDate: request.context?.date,
      });
      messages.push({ role: 'user', content: userPrompt });

      const response = await aiProvider.generate(messages, {
        tools: TOOL_DEFINITIONS as unknown as Array<{
          name: string;
          description: string;
          parameters: { type: 'object'; properties: Record<string, { type: string; description: string }>; required: string[] };
        }>,
      });

      const tasksExecuted: AgentTask[] = [];

      if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
          const task = await executeToolCall(request.userId, toolCall);
          tasksExecuted.push(task);

          const toolResultPrompt = createToolResultPrompt(
            mapToolNameToType(toolCall.name),
            task.output,
            task.error || undefined
          );
          messages.push({ role: 'user', content: toolResultPrompt });
        }

        const finalResponse = await aiProvider.generate(messages);
        return { success: true, message: finalResponse.text, tasksExecuted };
      }

      return { success: true, message: response.text, tasksExecuted: [] };
    } catch (error) {
      return {
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        tasksExecuted: [],
      };
    }
  };

  const clearHistory = (): void => { conversationHistory = []; };

  const addToHistory = (role: 'user' | 'model', content: string): void => {
    conversationHistory.push({ role, content });
  };

  return { execute, clearHistory, addToHistory };
};

let orchestratorInstance: ReturnType<typeof createOrchestrator> | null = null;

export const getOrchestrator = (): ReturnType<typeof createOrchestrator> => {
  if (!orchestratorInstance) orchestratorInstance = createOrchestrator();
  return orchestratorInstance;
};

export const resetOrchestrator = (): void => { orchestratorInstance = null; };

/**
 * シンプルなラッパー関数: ユーザーIDとプロンプトを渡すとAIが実行される
 */
export const runAgentOrchestrator = async (
  userId: string,
  prompt: string,
  userSettings?: OrchestratorUserSettings
): Promise<string> => {
  const orchestrator = createOrchestrator(userId, userSettings);
  const response = await orchestrator.execute({
    userId,
    prompt,
    context: { date: new Date() },
  });
  return response.message;
};
