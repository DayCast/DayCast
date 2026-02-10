# 🤖 YOPPY AI Todo Manager - サービス層完全ガイド

## 📖 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [セットアップ](#セットアップ)
4. [使い方](#使い方)
5. [各サービスの詳細](#各サービスの詳細)
6. [環境変数設定](#環境変数設定)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

このドキュメントでは、YOPPYのサービス層（コアロジック・AI機能）の実装を説明します。

### 担当B（コアロジック・AI機能）の成果物

✅ **20ファイル作成完了！**

- AIプロバイダー層（Vertex AI / Gemini API）
- 天気ツール（OpenWeatherMap / 気象庁API）
- カレンダーツール（Google Calendar）
- スクレイパーツール（Webスクレイピング）
- AIオーケストレーター（全てを統合）
- 通知ロジック

---

## アーキテクチャ

```
services/
├── agent/                      # AIエージェント
│   ├── prompts.ts              # プロンプト管理
│   ├── orchestrator.ts         # 🎯 司令塔（全てを統合）
│   └── providers/              # AIプロバイダー層
│       ├── base.ts             # 共通インターフェース
│       ├── vertexai.ts         # Vertex AI実装
│       ├── gemini.ts           # Gemini API実装
│       └── index.ts            # ファクトリー
│
├── tools/                      # 外部ツール
│   ├── weather.ts              # 天気ツール（メイン）
│   ├── weather/
│   │   ├── base.ts
│   │   ├── openweathermap.ts  # OpenWeatherMap実装
│   │   ├── jma.ts              # 気象庁API実装
│   │   └── index.ts
│   │
│   ├── calendar.ts             # カレンダーツール（メイン）
│   ├── calendar/
│   │   ├── base.ts
│   │   ├── google.ts           # Google Calendar実装
│   │   └── index.ts
│   │
│   ├── scraper.ts              # スクレイパーツール（メイン）
│   └── scraper/
│       ├── base.ts
│       ├── web-scraper.ts      # Webスクレイパー実装
│       └── index.ts
│
└── notification/               # 通知ロジック
    └── index.ts
```

---

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install @google-cloud/vertexai @google/generative-ai cheerio
```

### 2. 環境変数の設定

`.env.local` ファイルを作成：

```bash
# AI Provider選択（vertexai または gemini）
AI_PROVIDER=gemini

# Vertex AI用（AI_PROVIDER=vertexai の場合）
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=asia-northeast1

# Gemini API用（AI_PROVIDER=gemini の場合）
GEMINI_API_KEY=your-gemini-api-key

# 天気API選択（jma または openweathermap）
WEATHER_PROVIDER=jma

# OpenWeatherMap用（WEATHER_PROVIDER=openweathermap の場合）
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key

# Google Calendar用
GOOGLE_ACCESS_TOKEN=user-access-token
```

---

## 使い方

### 基本的な使い方

```typescript
import { getOrchestrator } from '@/services/agent/orchestrator';

// オーケストレーターを取得
const orchestrator = getOrchestrator();

// ユーザーリクエストを処理
const response = await orchestrator.execute({
  userId: 'user123',
  prompt: '明日の東京の天気を教えて',
});

console.log(response.message);
// => "明日の東京は晴れで、最高気温は15℃です。"

console.log(response.tasksExecuted);
// => [{ type: 'weather', status: 'success', ... }]
```

### 会話履歴を保持

```typescript
// 1回目
const response1 = await orchestrator.execute({
  userId: 'user123',
  prompt: '明日の予定を教えて',
});

// 会話履歴に追加
orchestrator.addToHistory('user', '明日の予定を教えて');
orchestrator.addToHistory('model', response1.message);

// 2回目（前の会話を覚えている）
const response2 = await orchestrator.execute({
  userId: 'user123',
  prompt: 'その後に1時間の空き時間ある？',
});
```

---

## 各サービスの詳細

### 1. AIプロバイダー（Vertex AI / Gemini API）

**選択可能なプロバイダー**：

| プロバイダー | メリット | デメリット |
|------------|---------|-----------|
| **Gemini API** | 簡単、APIキー1つでOK、無料枠あり | レート制限が厳しめ |
| **Vertex AI** | GCP統合、レート制限緩い、本番向け | GCPプロジェクト必要 |

**使用例**：

```typescript
import { getAIProvider } from '@/services/agent/providers';

const ai = getAIProvider();

const response = await ai.generate([
  { role: 'system', content: 'あなたは優秀なAIアシスタントです' },
  { role: 'user', content: 'こんにちは' },
]);

console.log(response.text);
```

---

### 2. 天気ツール（OpenWeatherMap / 気象庁API）

**選択可能なプロバイダー**：

| プロバイダー | メリット | デメリット |
|------------|---------|-----------|
| **気象庁API** | 完全無料、APIキー不要、日本特化 | 非公式API |
| **OpenWeatherMap** | 公式API、世界対応、詳細データ | APIキー必要 |

**使用例**：

```typescript
import { getCurrentWeather, formatWeatherData } from '@/services/tools/weather';

// 現在の天気
const result = await getCurrentWeather('東京');
if (result.success) {
  console.log(formatWeatherData(result.data));
}

// 天気予報
const forecast = await getWeatherForecast('大阪', 5);
```

**気象庁APIの対応地域**：

```typescript
import { getAvailableLocations } from '@/services/tools/weather';

const locations = getAvailableLocations();
// => ['東京', '大阪', '札幌', '福岡', '沖縄', ...]
```

---

### 3. カレンダーツール（Google Calendar）

**機能**：
- ✅ 予定の取得
- ✅ 予定の作成
- ✅ 予定の更新
- ✅ 予定の削除
- ✅ 空き時間の検索

**使用例**：

```typescript
import { createCalendarProvider } from '@/services/tools/calendar';
import { getTodayEvents, createCalendarEvent } from '@/services/tools/calendar';

// プロバイダー作成
const calendar = createCalendarProvider({
  type: 'google',
  accessToken: user.googleAccessToken,
});

// 今日の予定
const result = await getTodayEvents(calendar);
console.log(formatCalendarEvents(result.data));

// 予定を作成
await createCalendarEvent(calendar, {
  title: 'ミーティング',
  startTime: new Date('2026-02-10T15:00:00'),
  endTime: new Date('2026-02-10T16:00:00'),
  location: '会議室A',
});
```

---

### 4. スクレイパーツール（Webスクレイピング）

**機能**：
- ✅ HTMLページからコンテンツ抽出
- ✅ メタデータ取得（タイトル、著者、OGP）
- ✅ メインコンテンツの自動検出
- ✅ セキュリティ対策（localhost/プライベートIP禁止）

**使用例**：

```typescript
import { scrapeWebsite, formatScrapedData } from '@/services/tools/scraper';

// Webページをスクレイピング
const result = await scrapeWebsite('https://example.com/article');

if (result.success) {
  console.log(formatScrapedData(result.data));
}

// 特定要素のみ抽出
const result2 = await scrapeWebsite(
  'https://example.com/article',
  'article.content'  // CSSセレクタ
);
```

---

### 5. オーケストレーター（統合）

**役割**：
- AIプロバイダーとツールを統合
- ユーザーリクエストを解析
- 適切なツールを自動選択・実行
- 実行結果をAIに返して最終回答を生成

**フロー**：

```
ユーザー: "明日の東京の天気を教えて"
    ↓
オーケストレーター
    ↓
AIプロバイダー（Function Callingで天気ツールを呼ぶ）
    ↓
天気ツール実行（気象庁APIまたはOpenWeatherMap）
    ↓
結果をAIに返す
    ↓
AI: "明日の東京は晴れ、最高気温15℃です"
    ↓
ユーザーに返答
```

---

### 6. 通知ロジック

**機能**：
- ✅ Todo期限通知
- ✅ AIタスク完了通知
- ✅ システム通知

**使用例**：

```typescript
import {
  notifyTodoDueSoon,
  checkAndNotifyDueTodos,
} from '@/services/notification';

// 期限が近いTodoを通知
const notification = await notifyTodoDueSoon(todo);

// 全Todoをチェック
const notifications = await checkAndNotifyDueTodos(allTodos);
```

---

## 環境変数設定

### 開発環境（推奨）

```bash
# .env.local

# Gemini API + 気象庁API（無料、簡単）
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
WEATHER_PROVIDER=jma
```

### 本番環境（推奨）

```bash
# .env.production

# Vertex AI + OpenWeatherMap（安定、スケーラブル）
AI_PROVIDER=vertexai
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=asia-northeast1
WEATHER_PROVIDER=openweathermap
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
```

---

## API実装例

### Next.js API Route

```typescript
// app/api/agent/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/services/agent/orchestrator';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    const orchestrator = getOrchestrator();
    const response = await orchestrator.execute({
      userId: user.id,
      prompt,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## トラブルシューティング

### 1. Vertex AI認証エラー

**エラー**: `Vertex AI authentication failed`

**解決策**：
```bash
# ADCを設定
gcloud auth application-default login

# または環境変数を設定
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 2. Gemini APIレート制限

**エラー**: `Gemini API rate limit exceeded`

**解決策**：
- 無料プランの制限を確認
- 有料プランへのアップグレード
- リクエスト間隔を空ける

### 3. 気象庁API接続エラー

**エラー**: `JMA API connection failed`

**解決策**：
- 非公式APIのため、時々ダウンする
- OpenWeatherMapへの切り替えを検討
- リトライロジックを実装

### 4. Google Calendar認証エラー

**エラー**: `Google Calendar authentication failed`

**解決策**：
- アクセストークンの有効期限を確認
- リフレッシュトークンで更新
- 再認証を促す

---

## テスト

### 各ツールの接続テスト

```typescript
import { testWeatherConnection } from '@/services/tools/weather';
import { getAIProvider } from '@/services/agent/providers';

// 天気API
const weatherOk = await testWeatherConnection();
console.log('Weather API:', weatherOk ? '✅' : '❌');

// AI Provider
const ai = getAIProvider();
const aiOk = await ai.testConnection();
console.log('AI Provider:', aiOk ? '✅' : '❌');
```

---

## パフォーマンス最適化

### 1. キャッシング

```typescript
// 天気情報を5分間キャッシュ
const CACHE_TTL = 5 * 60 * 1000;
const weatherCache = new Map();

async function getCachedWeather(location: string) {
  const cached = weatherCache.get(location);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await getCurrentWeather(location);
  
  if (result.success) {
    weatherCache.set(location, {
      data: result.data,
      timestamp: Date.now(),
    });
  }

  return result.data;
}
```

### 2. 並列実行

```typescript
// 複数ツールを並列実行
const [weather, events] = await Promise.all([
  getCurrentWeather('東京'),
  getTodayEvents(calendar),
]);
```

---

## セキュリティ

### 1. 入力バリデーション

```typescript
// URLのバリデーション
const check = isScrapableUrl(url);
if (!check.valid) {
  throw new Error(check.reason);
}
```

### 2. レート制限

```typescript
// ユーザーごとのレート制限
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // 過去1分間のリクエストをフィルター
  const recentRequests = userRequests.filter(
    (time: number) => now - time < 60000
  );

  if (recentRequests.length >= 10) {
    return false;  // レート制限
  }

  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  
  return true;
}
```

---

## 次のステップ

### 担当A（バックエンド）との連携

1. **Prismaスキーマの実装**
2. **Server Actionsの作成**
3. **API Routesの実装**

### 担当C（フロントエンド）との連携

1. **UIコンポーネントの作成**
2. **チャットインターフェース**
3. **通知表示**

---

## 参考資料

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Cheerio Documentation](https://cheerio.js.org/)

---

**お疲れ様でした！担当B（コアロジック・AI機能）のパートが完成しました！🎉**
