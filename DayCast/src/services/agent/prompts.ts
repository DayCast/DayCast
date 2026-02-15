/**
 * AIエージェント用のプロンプト管理
 */

import type { AgentToolType } from '@/types/agent';

export const SYSTEM_PROMPT = `あなたは「YOPPY」という名前の優秀なAIアシスタントです。
ユーザーのタスク管理を支援し、以下のツールを適切に使用してユーザーをサポートします。

## 利用可能なツール

### 1. weather（天気情報取得）
- 指定された場所の現在の天気や予報を取得
- 使用例：「明日の東京の天気は？」「週末は傘が必要？」

### 2. calendar（Googleカレンダー操作）
- ユーザーの予定を取得・作成・更新
- 使用例：「明日の予定は？」「3時にミーティングを入れて」

### 3. scraper（Web情報収集）
- 指定されたWebサイトから情報を抽出
- 使用例：「このサイトの記事を要約して」「最新ニュースを教えて」

## 重要な原則

1. **正確性**: 不確実な情報は推測せず、ツールを使って確認する
2. **効率性**: 複数のタスクを並列実行できる場合は、同時に処理する
3. **親切さ**: ユーザーに分かりやすく、丁寧に対応する
4. **プライバシー**: ユーザーの個人情報を適切に扱う

## 応答形式

- 簡潔で分かりやすい日本語で応答
- 必要に応じて絵文字を使用
- 複数の情報がある場合は、箇条書きで整理

それでは、ユーザーの依頼に対応してください。`;

export const createUserPrompt = (userRequest: string, context?: {
  currentDate?: Date;
  timezone?: string;
  location?: string;
}): string => {
  const date = context?.currentDate || new Date();
  const timezone = context?.timezone || 'Asia/Tokyo';
  const location = context?.location || '東京';

  return `## 現在の状況
- 日時: ${formatDateTime(date, timezone)}
- タイムゾーン: ${timezone}
- ユーザーの位置: ${location}

## ユーザーからの依頼
${userRequest}

上記の依頼を分析し、必要なツールを使用して適切に対応してください。`;
};

export const createToolResultPrompt = (
  toolType: AgentToolType,
  result: unknown,
  error?: string
): string => {
  if (error) {
    return `## ツール実行エラー
ツール: ${getToolName(toolType)}
エラー: ${error}

このエラーをユーザーに分かりやすく説明し、代替案があれば提案してください。`;
  }

  return `## ツール実行結果
ツール: ${getToolName(toolType)}
結果:
${JSON.stringify(result, null, 2)}

この結果を基に、ユーザーに分かりやすく情報を提供してください。`;
};

export const createPlanningPrompt = (userRequest: string): string => {
  return `以下のユーザーリクエストを分析し、必要なタスクを特定してください。

ユーザーリクエスト: "${userRequest}"

以下の形式でタスクプランを作成してください：
1. 必要なツールのリスト（weather, calendar, scraper）
2. 各ツールに渡すパラメータ
3. タスクの実行順序`;
};

export const createTodoAssistPrompt = (
  userRequest: string,
  existingTodos?: Array<{ title: string; dueDate?: Date }>
): string => {
  let prompt = `ユーザーが新しいタスクを追加したいと言っています。

ユーザーのリクエスト: "${userRequest}"

以下の情報を抽出してください：
1. タスクのタイトル
2. 優先度（high, medium, low）
3. 期限（あれば）
4. 説明（あれば）

形式：
{
  "title": "タスクのタイトル",
  "priority": "medium",
  "dueDate": "2026-02-15",
  "description": "詳細な説明"
}`;

  if (existingTodos && existingTodos.length > 0) {
    prompt += `\n\n## 既存のタスク
${existingTodos.map(t => `- ${t.title}${t.dueDate ? ` (期限: ${formatDate(t.dueDate)})` : ''}`).join('\n')}`;
  }

  return prompt;
};

export const createReminderPrompt = (todoTitle: string, dueDate: Date): string => {
  return `タスク「${todoTitle}」の期限が近づいています。
期限: ${formatDateTime(dueDate)}
ユーザーに期限が近いことと残り時間を伝えてください。`;
};

export const createErrorRecoveryPrompt = (operation: string, error: string): string => {
  return `以下の操作でエラーが発生しました：
操作: ${operation}
エラー: ${error}
ユーザーに分かりやすく説明し、代替手段を提案してください。`;
};

const getToolName = (toolType: AgentToolType): string => {
  const names: Record<AgentToolType, string> = {
    weather: '天気情報取得', calendar: 'カレンダー操作', scraper: 'Web情報収集',
  };
  return names[toolType] || toolType;
};

const formatDateTime = (date: Date, timezone: string = 'Asia/Tokyo'): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: timezone,
  }).format(date);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date);
};

export const TOOL_DEFINITIONS = [
  {
    name: 'get_weather',
    description: '指定された場所の天気情報を取得します',
    parameters: {
      type: 'object' as const,
      properties: {
        location: { type: 'string', description: '天気を取得する場所（例: 東京、大阪）' },
        date: { type: 'string', description: '日付（YYYY-MM-DD形式、省略時は今日）' },
      },
      required: ['location'],
    },
  },
  {
    name: 'get_calendar_events',
    description: 'Googleカレンダーから予定を取得します',
    parameters: {
      type: 'object' as const,
      properties: {
        startDate: { type: 'string', description: '開始日（YYYY-MM-DD形式）' },
        endDate: { type: 'string', description: '終了日（YYYY-MM-DD形式）' },
      },
      required: ['startDate'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Googleカレンダーに新しい予定を作成します',
    parameters: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: '予定のタイトル' },
        startTime: { type: 'string', description: '開始日時（ISO 8601形式）' },
        endTime: { type: 'string', description: '終了日時（ISO 8601形式）' },
        description: { type: 'string', description: '予定の説明（オプション）' },
        location: { type: 'string', description: '場所（オプション）' },
      },
      required: ['title', 'startTime', 'endTime'],
    },
  },
  {
    name: 'scrape_website',
    description: '指定されたWebサイトから情報を抽出します',
    parameters: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'スクレイピングするWebサイトのURL' },
        selector: { type: 'string', description: '抽出するCSSセレクタ（オプション）' },
      },
      required: ['url'],
    },
  },
] as const;
