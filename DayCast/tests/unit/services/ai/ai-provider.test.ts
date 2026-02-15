/**
 * AI プロバイダーのテスト
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// GoogleGenerativeAI のモック
vi.mock('@google/generative-ai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Hello from Gemini!',
      functionCalls: () => null,
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
        totalTokenCount: 15,
      },
      candidates: [{ finishReason: 'STOP' }],
    },
  });

  const mockStartChat = vi.fn().mockReturnValue({
    sendMessage: mockSendMessage,
    sendMessageStream: vi.fn(),
  });

  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    startChat: mockStartChat,
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

// VertexAI のモック
vi.mock('@google-cloud/vertexai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Hello from Vertex!',
      functionCalls: () => null,
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
        totalTokenCount: 15,
      },
      candidates: [{ finishReason: 'STOP' }],
    },
  });

  return {
    VertexAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        startChat: vi.fn().mockReturnValue({
          sendMessage: mockSendMessage,
          sendMessageStream: vi.fn(),
        }),
      }),
    })),
  };
});

describe('Gemini Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createGeminiProvider がAPIキーなしでエラーを投げる', async () => {
    const { createGeminiProvider } = await import('@/services/ai/gemini');

    expect(() => createGeminiProvider({ type: 'gemini' })).toThrow(
      'Gemini API requires apiKey'
    );
  });

  it('createGeminiProvider がIAIProviderを返す', async () => {
    const { createGeminiProvider } = await import('@/services/ai/gemini');
    const provider = createGeminiProvider({
      type: 'gemini',
      apiKey: 'test-key',
    });

    expect(provider.name).toBe('gemini');
    expect(typeof provider.generate).toBe('function');
    expect(typeof provider.clearHistory).toBe('function');
    expect(typeof provider.testConnection).toBe('function');
  });

  it('generate がテキストレスポンスを返す', async () => {
    const { createGeminiProvider } = await import('@/services/ai/gemini');
    const provider = createGeminiProvider({
      type: 'gemini',
      apiKey: 'test-key',
    });

    const response = await provider.generate([
      { role: 'user', content: 'Hello' },
    ]);

    expect(response.text).toBe('Hello from Gemini!');
    expect(response.finishReason).toBe('stop');
    expect(response.usage).toBeDefined();
  });
});

describe('Vertex AI Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createVertexAIProvider がprojectIdなしでエラーを投げる', async () => {
    const { createVertexAIProvider } = await import('@/services/ai/vertexai');

    expect(() => createVertexAIProvider({ type: 'vertexai' })).toThrow(
      'Vertex AI requires projectId and location'
    );
  });

  it('createVertexAIProvider がIAIProviderを返す', async () => {
    const { createVertexAIProvider } = await import('@/services/ai/vertexai');
    const provider = createVertexAIProvider({
      type: 'vertexai',
      projectId: 'test-project',
      location: 'us-central1',
    });

    expect(provider.name).toBe('vertexai');
    expect(typeof provider.generate).toBe('function');
    expect(typeof provider.clearHistory).toBe('function');
  });

  it('generate がテキストレスポンスを返す', async () => {
    const { createVertexAIProvider } = await import('@/services/ai/vertexai');
    const provider = createVertexAIProvider({
      type: 'vertexai',
      projectId: 'test-project',
      location: 'us-central1',
    });

    const response = await provider.generate([
      { role: 'user', content: 'Hello' },
    ]);

    expect(response.text).toBe('Hello from Vertex!');
    expect(response.finishReason).toBe('stop');
  });
});

describe('AI Provider Factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('createAIProvider がGeminiプロバイダーを作成できる', async () => {
    const { createAIProvider } = await import('@/services/ai/index');
    const provider = createAIProvider({
      type: 'gemini',
      apiKey: 'test-key',
    });
    expect(provider.name).toBe('gemini');
  });

  it('createAIProvider がVertexAIプロバイダーを作成できる', async () => {
    const { createAIProvider } = await import('@/services/ai/index');
    const provider = createAIProvider({
      type: 'vertexai',
      projectId: 'test-project',
      location: 'us-central1',
    });
    expect(provider.name).toBe('vertexai');
  });

  it('不明なプロバイダータイプでエラーを投げる', async () => {
    const { createAIProvider } = await import('@/services/ai/index');
    expect(() =>
      createAIProvider({ type: 'unknown' as 'gemini' })
    ).toThrow('Unknown AI provider type');
  });
});

describe('ユーザーごとのAIプロバイダー切替', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('GCP_PROJECT_ID', 'test-project');
    vi.stubEnv('GCP_LOCATION', 'us-central1');
  });

  it('getAIProviderForUser がユーザー設定に基づいてGeminiを返す', async () => {
    const { getAIProviderForUser } = await import('@/services/ai/index');
    const provider = getAIProviderForUser('user-1', {
      aiProvider: 'gemini',
      aiModel: 'gemini-2.0-flash-exp',
    });
    expect(provider.name).toBe('gemini');
  });

  it('getAIProviderForUser がユーザー設定に基づいてVertexAIを返す', async () => {
    const { getAIProviderForUser } = await import('@/services/ai/index');
    const provider = getAIProviderForUser('user-2', {
      aiProvider: 'vertexai',
      aiModel: 'gemini-2.0-flash-exp',
    });
    expect(provider.name).toBe('vertexai');
  });

  it('同じユーザー設定ではキャッシュされたインスタンスを返す', async () => {
    const { getAIProviderForUser } = await import('@/services/ai/index');
    const settings = { aiProvider: 'gemini', aiModel: 'gemini-2.0-flash-exp' };
    const p1 = getAIProviderForUser('user-3', settings);
    const p2 = getAIProviderForUser('user-3', settings);
    expect(p1).toBe(p2);
  });

  it('resetUserAIProvider でキャッシュがクリアされる', async () => {
    const { getAIProviderForUser, resetUserAIProvider } = await import('@/services/ai/index');
    const settings = { aiProvider: 'gemini', aiModel: 'gemini-2.0-flash-exp' };
    const p1 = getAIProviderForUser('user-4', settings);
    resetUserAIProvider('user-4');
    const p2 = getAIProviderForUser('user-4', settings);
    expect(p1).not.toBe(p2);
  });
});
