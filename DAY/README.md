# 📋 YOPPY AI Todo Manager - 型定義と定数の完全ガイド

## 📖 目次

1. [概要](#概要)
2. [設計思想](#設計思想)
3. [ファイル構成](#ファイル構成)
4. [型定義の詳細](#型定義の詳細)
5. [定数の詳細](#定数の詳細)
6. [実装例](#実装例)
7. [チェックリスト](#チェックリスト)
8. [開発の進め方](#開発の進め方)

---

## 概要

このドキュメントでは、AIエージェントTodoアプリ「YOPPY」の型定義（`types/`）と定数（`constants/`）の設計を説明します。

### プロジェクトの特徴

- **言語**: TypeScript
- **フレームワーク**: Next.js 14 (App Router)
- **データベース**: Prisma ORM
- **認証**: 複数OAuth対応（Google, GitHub, Apple, X, Microsoft）
- **AI**: Gemini 2.0 Flash

---

## 🎯 設計思想

### なぜこの構造にしたか

1. **ドメイン駆動設計**: 各ビジネス概念（User, Todo, Agentなど）ごとにファイルを分割
2. **型安全性**: Union型を活用し、不正な値を代入できないようにする
3. **再利用性**: APIレスポンス、ツール実行結果など、共通パターンは汎用型として定義
4. **拡張性**: 新しい機能追加時に既存コードへの影響を最小化

---

## 📁 ファイル構成

```
yoppy/
├── kazuma/
│   ├── prisma/
│   │   └── schema.prisma          # データベーススキーマ
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── (auth)/            # 認証画面
│   │   │   ├── (dashboard)/       # メイン画面
│   │   │   ├── api/               # API Routes & Webhooks
│   │   │   └── actions/           # Server Actions
│   │   ├── services/              # コアロジック
│   │   │   ├── agent/             # AIエージェント
│   │   │   ├── tools/             # 外部API連携
│   │   │   └── notification/      # 通知ロジック
│   │   ├── components/            # UIコンポーネント
│   │   ├── lib/                   # 共通ライブラリ
│   │   ├── types/                 # 🎯 型定義（このドキュメントの主題）
│   │   │   ├── index.ts           # 全型のエクスポート
│   │   │   ├── user.ts            # ユーザー関連
│   │   │   ├── todo.ts            # Todo関連
│   │   │   ├── agent.ts           # AIエージェント関連
│   │   │   ├── notification.ts    # 通知関連
│   │   │   ├── tools.ts           # 外部ツール関連
│   │   │   ├── api.ts             # API共通型
│   │   │   └── auth.ts            # 認証関連
│   │   └── constants/             # 🎯 定数（このドキュメントの主題）
│   │       ├── index.ts           # Todo関連定数
│   │       ├── agent.ts           # AIエージェント関連定数
│   │       ├── notification.ts    # 通知関連定数
│   │       ├── api.ts             # API関連定数
│   │       ├── app.ts             # アプリ全体設定
│   │       └── auth.ts            # 認証関連定数
```

---

## 🔍 型定義の詳細

### types/index.ts

全ての型を一箇所からエクスポート。

```typescript
export * from './user';
export * from './todo';
export * from './agent';
export * from './notification';
export * from './tools';
export * from './api';
export * from './auth';
```

**使い方**:
```typescript
// 個別インポート
import { User, Todo } from '@/types';

// 名前空間インポート
import * as Types from '@/types';
```

---

### types/auth.ts - 認証関連

**サポートする認証プロバイダー**:

```typescript
export type AuthProvider = 
  | 'google'      // Google OAuth
  | 'github'      // GitHub OAuth
  | 'apple'       // Apple Sign In
  | 'twitter'     // X (旧Twitter)
  | 'microsoft'   // Microsoft/Azure AD
  | 'email';      // メール/パスワード
```

**OAuth連携アカウント**:

```typescript
export type OAuthAccount = {
  id: string;
  userId: string;              // User.idへの参照
  provider: AuthProvider;
  providerAccountId: string;   // 各サービス側のユーザーID
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType?: string;
  scope?: string;
  idToken?: string;            // OpenID Connect用
  createdAt: Date;
  updatedAt: Date;
};
```

**ポイント**:
- 1ユーザーが複数のプロバイダーと連携可能
- トークン情報を安全に保存
- 期限切れトークンの自動リフレッシュに対応

---

### types/user.ts - ユーザー関連

**ユーザーの基本情報**:

```typescript
export type User = {
  id: string;                    // 内部ID（cuid）
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: Date;
  primaryProvider: AuthProvider; // メイン認証方法
  createdAt: Date;
  updatedAt: Date;
};
```

**ユーザー設定**:

```typescript
export type UserSettings = {
  id: string;
  userId: string;
  
  // 連携状態
  googleConnected: boolean;
  googleCalendarId?: string;
  githubConnected: boolean;
  appleConnected: boolean;
  twitterConnected: boolean;
  
  // アプリ設定
  timezone: string;
  location?: string;
  enableNotifications: boolean;
  aiAutoMode: boolean;           // AIが自動でタスクを実行するか
  updatedAt: Date;
};
```

**ポイント**:
- 内部IDと外部サービスのIDを分離
- 各サービスの連携状態を個別管理
- タイムゾーン対応

---

### types/todo.ts - Todo関連

**優先度とステータス**:

```typescript
export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'in_progress' | 'completed';
```

**Todoの基本型**:

```typescript
export type Todo = {
  id: string;
  title: string;
  description?: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate?: Date;
  completedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
```

**入力型（フロントエンド用）**:

```typescript
// 作成時
export type CreateTodoInput = {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: Date;
};

// 更新時
export type UpdateTodoInput = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
};
```

**ポイント**:
- Union型で値を厳密に制限
- 入力型と完全型を分離（IDや日時は自動生成）
- `?`でオプショナルを明示

---

### types/agent.ts - AIエージェント関連

**ツールタイプ**:

```typescript
export type AgentToolType = 
  | 'weather'      // 天気情報取得
  | 'calendar'     // カレンダー操作
  | 'scraper';     // Webスクレイピング
```

**タスクステータス**:

```typescript
export type AgentTaskStatus = 
  | 'queued'       // 待機中
  | 'running'      // 実行中
  | 'success'      // 成功
  | 'failed';      // 失敗
```

**エージェントタスク**:

```typescript
export type AgentTask = {
  id: string;
  userId: string;
  type: AgentToolType;
  status: AgentTaskStatus;
  input: Record<string, any>;      // ツールへの入力データ
  output?: Record<string, any>;    // ツールからの出力データ
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
};
```

**AIへのリクエスト**:

```typescript
export type AgentRequest = {
  userId: string;
  prompt: string;           // ユーザーからの指示
  context?: {
    todoId?: string;
    date?: Date;
  };
};
```

**AIからのレスポンス**:

```typescript
export type AgentResponse = {
  success: boolean;
  message: string;          // AIからの返答
  tasksExecuted: AgentTask[];
  suggestedActions?: {      // AIが提案する次のアクション
    type: string;
    description: string;
    data?: Record<string, any>;
  }[];
};
```

**ポイント**:
- AIが使えるツールを型で制限
- 実行結果を構造化して保存
- AIが次のアクションを提案できる

---

### types/notification.ts - 通知関連

**通知タイプ**:

```typescript
export type NotificationType = 
  | 'todo_due_soon'        // Todo期限が近い
  | 'todo_overdue'         // Todo期限切れ
  | 'agent_task_complete'  // AIタスク完了
  | 'agent_task_failed'    // AIタスク失敗
  | 'system';              // システム通知
```

**通知**:

```typescript
export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: 'unread' | 'read';
  data?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
};
```

---

### types/tools.ts - 外部ツール関連

**天気情報**:

```typescript
export type WeatherData = {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast?: {
    date: string;
    high: number;
    low: number;
    condition: string;
  }[];
  fetchedAt: Date;
};
```

**カレンダーイベント**:

```typescript
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
};
```

**スクレイピング結果**:

```typescript
export type ScrapedData = {
  url: string;
  title?: string;
  content: string;
  metadata?: {
    author?: string;
    publishedAt?: Date;
    tags?: string[];
  };
  scrapedAt: Date;
};
```

**ツール実行結果の共通型**:

```typescript
export type ToolResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

---

### types/api.ts - API共通型

**成功レスポンス**:

```typescript
export type ApiResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};
```

**エラーレスポンス**:

```typescript
export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};
```

**ページネーション**:

```typescript
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: Pagination;
}>;
```

**使用例**:

```typescript
// 成功
const response: ApiResponse<Todo[]> = {
  success: true,
  data: [{ id: '1', title: 'test', ... }]
};

// エラー
const error: ApiError = {
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'Todoが見つかりません'
  }
};
```

---

## 🎨 定数の詳細

### constants/index.ts - Todo関連

```typescript
export const TODO_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TODO_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// 表示用
export const PRIORITY_COLORS = {
  high: '#ef4444',      // 赤
  medium: '#f59e0b',    // オレンジ
  low: '#10b981',       // 緑
} as const;

export const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
} as const;

export const STATUS_LABELS = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了',
} as const;
```

**`as const`の重要性**:

```typescript
// ❌ as constなし
const PRIORITIES = { HIGH: 'high' };
// 型: { HIGH: string } - どんな文字列でもOK

// ✅ as constあり
const PRIORITIES = { HIGH: 'high' } as const;
// 型: { HIGH: 'high' } - 厳密に'high'のみ
```

---

### constants/agent.ts - AIエージェント関連

```typescript
export const AGENT_TASK_STATUSES = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const AGENT_TOOL_TYPES = {
  WEATHER: 'weather',
  CALENDAR: 'calendar',
  SCRAPER: 'scraper',
} as const;

export const AI_SETTINGS = {
  // Gemini API設定
  MODEL: 'gemini-2.0-flash-exp',
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.7,
  
  // リトライ設定
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // タイムアウト設定
  TIMEOUT_MS: 30000,
  
  // 並列実行設定
  MAX_CONCURRENT_TASKS: 3,
} as const;

export const PROMPT_TEMPLATES = {
  SYSTEM: `あなたは優秀なAIアシスタントです。
ユーザーのタスク管理を支援し、必要に応じて以下のツールを使用できます：
- 天気情報の取得
- Googleカレンダーの操作
- Webサイトからの情報収集

常に正確で、親切で、効率的な対応を心がけてください。`,

  USER_REQUEST: (prompt: string) => 
    `ユーザーからの依頼: ${prompt}\n\n上記の依頼を分析し、必要なアクションを実行してください。`,
} as const;
```

---

### constants/notification.ts - 通知関連

```typescript
export const NOTIFICATION_TYPES = {
  TODO_DUE_SOON: 'todo_due_soon',
  TODO_OVERDUE: 'todo_overdue',
  AGENT_TASK_COMPLETE: 'agent_task_complete',
  AGENT_TASK_FAILED: 'agent_task_failed',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_CONFIG = {
  todo_due_soon: {
    icon: '⏰',
    color: '#f59e0b',
    title: 'タスク期限が近づいています',
  },
  todo_overdue: {
    icon: '🔴',
    color: '#ef4444',
    title: 'タスクが期限切れです',
  },
  agent_task_complete: {
    icon: '✅',
    color: '#10b981',
    title: 'AIタスクが完了しました',
  },
  agent_task_failed: {
    icon: '❌',
    color: '#ef4444',
    title: 'AIタスクが失敗しました',
  },
  system: {
    icon: 'ℹ️',
    color: '#3b82f6',
    title: 'システム通知',
  },
} as const;
```

---

### constants/api.ts - API関連

```typescript
export const API_ROUTES = {
  // Todo
  TODOS: '/api/todos',
  TODO_BY_ID: (id: string) => `/api/todos/${id}`,
  
  // Agent
  AGENT_EXECUTE: '/api/agent/execute',
  AGENT_TASKS: '/api/agent/tasks',
  
  // Notification
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read`,
  
  // Settings
  SETTINGS: '/api/settings',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  // 認証エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // リソースエラー
  NOT_FOUND: 'NOT_FOUND',
  
  // サーバーエラー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  
  // AI関連エラー
  AI_TIMEOUT: 'AI_TIMEOUT',
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
```

---

### constants/auth.ts - 認証関連

```typescript
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  APPLE: 'apple',
  TWITTER: 'twitter',
  MICROSOFT: 'microsoft',
  EMAIL: 'email',
} as const;

export const PROVIDER_INFO = {
  google: {
    name: 'Google',
    icon: '🔵',
    color: '#4285F4',
    features: ['カレンダー連携', 'Gmail連携'],
  },
  github: {
    name: 'GitHub',
    icon: '⚫',
    color: '#181717',
    features: ['Issue管理', 'PR通知'],
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: '#000000',
    features: ['プライバシー重視'],
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '🐦',
    color: '#1DA1F2',
    features: ['ツイート投稿'],
  },
  microsoft: {
    name: 'Microsoft',
    icon: '🪟',
    color: '#00A4EF',
    features: ['Outlook連携'],
  },
  email: {
    name: 'メール',
    icon: '📧',
    color: '#6B7280',
    features: ['パスワード管理'],
  },
} as const;

export const OAUTH_SCOPES = {
  google: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
  ],
  github: [
    'read:user',
    'user:email',
  ],
  apple: [
    'name',
    'email',
  ],
  twitter: [
    'tweet.read',
    'users.read',
  ],
  microsoft: [
    'openid',
    'email',
    'profile',
    'Calendars.ReadWrite',
  ],
} as const;
```

---

## 💡 実装例

### ケース1: Todoを作成する

```typescript
import { CreateTodoInput, Todo } from '@/types';
import { TODO_PRIORITIES, TODO_STATUSES } from '@/constants';

// フロントエンド
const input: CreateTodoInput = {
  title: '資料作成',
  priority: TODO_PRIORITIES.HIGH,  // ← 定数使用で安全
  dueDate: new Date('2026-02-10'),
};

// バックエンド（API）
const newTodo: Todo = {
  id: generateId(),
  ...input,
  status: TODO_STATUSES.PENDING,
  userId: currentUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

### ケース2: AIエージェントを実行する

```typescript
import { AgentRequest, AgentResponse } from '@/types';
import { AI_SETTINGS, AGENT_TOOL_TYPES } from '@/constants/agent';

// AIにリクエスト
const request: AgentRequest = {
  userId: user.id,
  prompt: '明日の天気を教えて',
  context: {
    date: new Date('2026-02-09'),
  },
};

// AIが実行（内部処理）
const response: AgentResponse = {
  success: true,
  message: '明日は晴れ、最高気温15℃です',
  tasksExecuted: [{
    id: '1',
    userId: user.id,
    type: AGENT_TOOL_TYPES.WEATHER,  // ← 定数使用
    status: 'success',
    input: { location: 'Tokyo' },
    output: { temp: 15, condition: 'sunny' },
    createdAt: new Date(),
  }],
};
```

---

### ケース3: エラーハンドリング

```typescript
import { ApiError } from '@/types';
import { ERROR_CODES } from '@/constants/api';

// APIエラーレスポンス
const errorResponse: ApiError = {
  success: false,
  error: {
    code: ERROR_CODES.NOT_FOUND,
    message: '指定されたTodoが見つかりません',
    details: { todoId: '123' },
  },
};

// フロントエンドでのエラー処理
if (!response.success) {
  switch (response.error.code) {
    case ERROR_CODES.NOT_FOUND:
      alert('Todoが見つかりません');
      break;
    case ERROR_CODES.AI_TIMEOUT:
      alert('AI処理がタイムアウトしました');
      break;
  }
}
```

---

### ケース4: OAuth認証フロー

```typescript
import { handleOAuthSignIn } from '@/actions/auth';
import type { OAuthUserInfo } from '@/types';
import { AUTH_PROVIDERS } from '@/constants/auth';

// Google認証後
const googleUser: OAuthUserInfo = {
  provider: AUTH_PROVIDERS.GOOGLE,
  providerAccountId: '108234567890',
  email: 'user@gmail.com',
  name: 'Taro Yamada',
  avatar: 'https://...',
  accessToken: 'ya29...',
  refreshToken: '1//...',
  expiresAt: new Date(Date.now() + 3600000),
};

const result = await handleOAuthSignIn(googleUser);
if (result.success) {
  console.log('ユーザー作成/更新成功:', result.user);
}
```

---

## ✅ チェックリスト

型定義を作る際は以下を確認：

- [ ] Union型で値を制限しているか
- [ ] オプショナル（`?`）と必須を適切に使い分けているか
- [ ] 入力型（`CreateXxxInput`）と完全型（`Xxx`）を分けているか
- [ ] `as const`を付けて定数を不変にしているか
- [ ] 日本語ラベルを別定数として用意しているか
- [ ] エラーコードを一箇所で管理しているか
- [ ] ジェネリック型を活用しているか
- [ ] 型のエクスポートを`index.ts`にまとめているか

---

## 🚀 開発の進め方

### フェーズ1: 基盤構築（1週目）

**担当A（バックエンド）**
1. Prismaスキーマ作成
2. `lib/prisma.ts`でDB接続
3. `actions/`でServer Actions実装

**担当B（AI機能）**
1. `services/agent/orchestrator.ts`実装
2. `services/tools/`各ツール実装
3. Gemini API連携

**担当C（フロントエンド）**
1. 認証画面UI作成
2. ダッシュボードレイアウト
3. Todoリストコンポーネント

### フェーズ2: 機能実装（2週目）

**全員共通**
- 型定義を参照しながら実装
- API仕様に沿ってエンドポイント作成
- エラーハンドリングを統一

### フェーズ3: 統合テスト（3週目）

**全員共通**
- E2Eテスト
- バグ修正
- パフォーマンス最適化

---

## 📚 参考資料

### TypeScript公式
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

### Next.js
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Prisma
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

### 認証
- [NextAuth.js](https://next-auth.js.org/)
- [OAuth 2.0](https://oauth.net/2/)

---

## 🔧 トラブルシューティング

### 型エラーが出る

```typescript
// ❌ 型が合わない
const priority: TodoPriority = 'urgent';  // エラー！

// ✅ 定数を使う
import { TODO_PRIORITIES } from '@/constants';
const priority: TodoPriority = TODO_PRIORITIES.HIGH;
```

### as constを忘れた

```typescript
// ❌ 型推論が緩い
const STATUS = { PENDING: 'pending' };
// 型: { PENDING: string }

// ✅ 厳密な型
const STATUS = { PENDING: 'pending' } as const;
// 型: { PENDING: 'pending' }
```

### Prismaの型とずれる

```typescript
// Prismaから型を自動生成
import { Todo as PrismaTodo } from '@prisma/client';

// 独自の型と組み合わせ
export type TodoWithUser = PrismaTodo & {
  user: {
    name: string;
    avatar?: string;
  };
};
```

---

## 📞 サポート

質問や問題があれば、以下の方法で連絡してください：

- **Issues**: GitHubのIssueを作成
- **Slack**: #yoppy-dev チャンネル
- **ドキュメント**: このREADMEを随時更新

---

## 📝 更新履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-02-08 | 初版作成 | Claude |

---

**Happy Coding! 🎉**
