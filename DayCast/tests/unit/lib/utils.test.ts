/**
 * lib/utils のテスト
 */
import { describe, it, expect } from 'vitest';

describe('safeParseAiResponse', () => {
  it('正しいJSON配列をパースできる', async () => {
    const { safeParseAiResponse } = await import('@/lib/utils');

    const rawText = `
      以下がスコアリング結果です：
      [
        {"id": "todo-1", "score": 85, "reason": "期限が近い"},
        {"id": "todo-2", "score": 40, "reason": "優先度低め"}
      ]
    `;

    const result = safeParseAiResponse(rawText);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    expect(result![0].id).toBe('todo-1');
    expect(result![0].score).toBe(85);
  });

  it('不正なJSONでnullを返す', async () => {
    const { safeParseAiResponse } = await import('@/lib/utils');
    const result = safeParseAiResponse('これは普通のテキストです');
    expect(result).toBeNull();
  });

  it('スコアが範囲外の場合nullを返す', async () => {
    const { safeParseAiResponse } = await import('@/lib/utils');
    const rawText = '[{"id": "todo-1", "score": 150, "reason": "invalid"}]';
    const result = safeParseAiResponse(rawText);
    expect(result).toBeNull();
  });
});
