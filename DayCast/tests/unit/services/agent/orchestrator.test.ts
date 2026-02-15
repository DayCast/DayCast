/**
 * Orchestrator のテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// AI Provider モック
vi.mock('@/services/ai/index', () => ({
  getAIProvider: vi.fn().mockReturnValue({
    name: 'gemini',
    generate: vi.fn().mockResolvedValue({
      text: 'AIからの返答です',
      toolCalls: undefined,
      finishReason: 'stop',
    }),
    clearHistory: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
  }),
  resetAIProvider: vi.fn(),
}));

// Weather モック
vi.mock('@/services/tools/weather/weather-tools', () => ({
  getCurrentWeather: vi.fn().mockResolvedValue({
    success: true,
    data: { location: '東京', temperature: 15, condition: '晴れ', humidity: 50, windSpeed: 3, fetchedAt: new Date() },
  }),
  getWeatherForecast: vi.fn().mockResolvedValue({
    success: true,
    data: { location: '東京', temperature: 15, condition: '晴れ', humidity: 50, windSpeed: 3, fetchedAt: new Date() },
  }),
}));

// Scraper モック
vi.mock('@/services/tools/scraper/scraper-tools', () => ({
  scrapeWebsite: vi.fn().mockResolvedValue({
    success: true,
    data: { url: 'https://example.com', content: 'test content', scrapedAt: new Date() },
  }),
}));

describe('Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOrchestrator がオーケストレーターを返す', async () => {
    const { createOrchestrator } = await import('@/services/agent/orchestrator');
    const orchestrator = createOrchestrator();

    expect(typeof orchestrator.execute).toBe('function');
    expect(typeof orchestrator.clearHistory).toBe('function');
    expect(typeof orchestrator.addToHistory).toBe('function');
  });

  it('execute がツール不要のリクエストを処理できる', async () => {
    const { createOrchestrator } = await import('@/services/agent/orchestrator');
    const orchestrator = createOrchestrator();

    const response = await orchestrator.execute({
      userId: 'user-1',
      prompt: 'こんにちは',
    });

    expect(response.success).toBe(true);
    expect(response.message).toBe('AIからの返答です');
    expect(response.tasksExecuted).toHaveLength(0);
  });

  it('clearHistory が会話履歴をクリアする', async () => {
    const { createOrchestrator } = await import('@/services/agent/orchestrator');
    const orchestrator = createOrchestrator();

    orchestrator.addToHistory('user', 'test message');
    orchestrator.clearHistory();
    // エラーなく動作することを確認
    expect(true).toBe(true);
  });

  it('execute がエラー時にsucess:falseを返す', async () => {
    const { getAIProvider } = await import('@/services/ai/index');
    vi.mocked(getAIProvider).mockReturnValueOnce({
      name: 'gemini',
      generate: vi.fn().mockRejectedValue(new Error('API Error')),
      clearHistory: vi.fn(),
      testConnection: vi.fn().mockResolvedValue(false),
    });

    const { createOrchestrator } = await import('@/services/agent/orchestrator');
    const orchestrator = createOrchestrator();

    const response = await orchestrator.execute({
      userId: 'user-1',
      prompt: 'エラーテスト',
    });

    expect(response.success).toBe(false);
    expect(response.message).toContain('エラー');
  });
});

describe('Prompts', () => {
  it('SYSTEM_PROMPT が定義されている', async () => {
    const { SYSTEM_PROMPT } = await import('@/services/agent/prompts');
    expect(SYSTEM_PROMPT).toBeDefined();
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('createUserPrompt がプロンプトを生成する', async () => {
    const { createUserPrompt } = await import('@/services/agent/prompts');
    const prompt = createUserPrompt('テスト依頼');

    expect(prompt).toContain('テスト依頼');
    expect(prompt).toContain('日時');
  });

  it('TOOL_DEFINITIONS が4つのツールを定義している', async () => {
    const { TOOL_DEFINITIONS } = await import('@/services/agent/prompts');
    expect(TOOL_DEFINITIONS).toHaveLength(4);
    expect(TOOL_DEFINITIONS.map(t => t.name)).toContain('get_weather');
    expect(TOOL_DEFINITIONS.map(t => t.name)).toContain('get_calendar_events');
    expect(TOOL_DEFINITIONS.map(t => t.name)).toContain('create_calendar_event');
    expect(TOOL_DEFINITIONS.map(t => t.name)).toContain('scrape_website');
  });

  it('createToolResultPrompt がエラー時にエラーメッセージを含む', async () => {
    const { createToolResultPrompt } = await import('@/services/agent/prompts');
    const prompt = createToolResultPrompt('weather', undefined, '接続エラー');

    expect(prompt).toContain('エラー');
    expect(prompt).toContain('接続エラー');
  });
});
