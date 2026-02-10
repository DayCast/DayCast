# 🔧 環境変数セットアップガイド

## 📋 目次

1. [クイックスタート](#クイックスタート)
2. [各サービスの設定方法](#各サービスの設定方法)
3. [開発環境と本番環境の違い](#開発環境と本番環境の違い)
4. [トラブルシューティング](#トラブルシューティング)

---

## クイックスタート

### 最速で始める（開発環境）

```bash
# 1. サンプルファイルをコピー
cp .env.local.example .env.local

# 2. 必須項目を設定
# - DATABASE_URL
# - GEMINI_API_KEY
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - NEXTAUTH_SECRET

# 3. 起動
npm run dev
```

---

## 各サービスの設定方法

### 1. データベース（PostgreSQL）

**ローカル開発**：

```bash
# Dockerで起動
docker run --name yoppy-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=yoppy_dev \
  -p 5432:5432 \
  -d postgres:15

# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/yoppy_dev"
```

**Supabase使用**：

```bash
# Supabaseプロジェクトから取得
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

---

### 2. AI Provider（Vertex AI / Gemini API）

#### オプション1: Gemini API（推奨：開発環境）

**取得方法**：
1. https://aistudio.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. APIキーをコピー

```bash
# .env.local
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your-api-key
```

**料金**：
- 無料枠: 15 RPM（リクエスト/分）
- 有料プラン: $0.075/100万トークン（入力）

---

#### オプション2: Vertex AI（推奨：本番環境）

**セットアップ手順**：

```bash
# 1. GCPプロジェクト作成
gcloud projects create yoppy-production

# 2. Vertex AI APIを有効化
gcloud services enable aiplatform.googleapis.com --project=yoppy-production

# 3. サービスアカウント作成
gcloud iam service-accounts create yoppy-ai \
  --project=yoppy-production

# 4. 権限付与
gcloud projects add-iam-policy-binding yoppy-production \
  --member="serviceAccount:yoppy-ai@yoppy-production.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 5. キーをダウンロード
gcloud iam service-accounts keys create vertex-key.json \
  --iam-account=yoppy-ai@yoppy-production.iam.gserviceaccount.com

# 6. 環境変数設定
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/vertex-key.json
```

```bash
# .env.production
AI_PROVIDER=vertexai
GCP_PROJECT_ID=yoppy-production
GCP_LOCATION=asia-northeast1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/vertex-key.json
```

**料金**：
- Gemini 2.0 Flash: $0.075/100万トークン（入力）
- レート制限が緩い

---

### 3. Weather API

#### オプション1: 気象庁API（推奨：開発環境）

**設定**：
```bash
# .env.local
WEATHER_PROVIDER=jma
# APIキー不要！
```

**特徴**：
- ✅ 完全無料
- ✅ APIキー不要
- ⚠️ 非公式API（予告なく変更の可能性）
- 📍 日本国内のみ

---

#### オプション2: OpenWeatherMap（推奨：本番環境）

**取得方法**：
1. https://openweathermap.org/api にアクセス
2. サインアップ
3. API Keysページでキーを取得

```bash
# .env.production
WEATHER_PROVIDER=openweathermap
OPENWEATHERMAP_API_KEY=your-api-key
```

**料金**：
- 無料プラン: 1,000 calls/day
- 有料プラン: $0.0012/call

---

### 4. Google OAuth（必須）

**Google Cloud Consoleでの設定**：

1. https://console.cloud.google.com/ にアクセス
2. プロジェクトを作成
3. 「APIとサービス」→「認証情報」
4. 「OAuth 2.0 クライアントID」を作成

**設定項目**：
- アプリケーションの種類: ウェブアプリケーション
- 承認済みのリダイレクトURI:
  - 開発: `http://localhost:3000/api/auth/callback/google`
  - 本番: `https://yourdomain.com/api/auth/callback/google`

**スコープ設定**：
1. 「OAuth同意画面」を設定
2. スコープを追加:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/calendar`

```bash
# .env.local
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...
```

---

### 5. NextAuth

**SECRETの生成**：

```bash
# ランダムな文字列を生成
openssl rand -base64 32
# または
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret

# .env.production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
```

---

### 6. その他のOAuthプロバイダー（オプション）

#### GitHub OAuth

1. https://github.com/settings/developers
2. 「New OAuth App」
3. Callback URL: `http://localhost:3000/api/auth/callback/github`

```bash
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

#### Apple Sign In

1. https://developer.apple.com/account/resources/identifiers/list
2. Services IDを作成

```bash
APPLE_CLIENT_ID=your-service-id
APPLE_CLIENT_SECRET=your-generated-secret
```

---

## 開発環境と本番環境の違い

### 開発環境（.env.local）

```bash
# 優先事項: 簡単さ、無料
AI_PROVIDER=gemini              # APIキー1つで簡単
WEATHER_PROVIDER=jma            # 無料、APIキー不要
DATABASE_URL=localhost          # ローカルDB
NEXTAUTH_URL=localhost:3000
```

### 本番環境（.env.production）

```bash
# 優先事項: 安定性、スケーラビリティ
AI_PROVIDER=vertexai            # GCP統合、レート制限緩い
WEATHER_PROVIDER=openweathermap # 公式API、世界対応
DATABASE_URL=production-db      # Supabase/Planetscale
NEXTAUTH_URL=https://yourdomain.com
```

---

## 環境変数チェックリスト

### 最小限の設定（開発開始に必要）

- [ ] `DATABASE_URL`
- [ ] `AI_PROVIDER` = gemini
- [ ] `GEMINI_API_KEY`
- [ ] `WEATHER_PROVIDER` = jma
- [ ] `NEXTAUTH_SECRET`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`

### 本番デプロイ前に必要

- [ ] `AI_PROVIDER` = vertexai
- [ ] `GCP_PROJECT_ID`
- [ ] `WEATHER_PROVIDER` = openweathermap
- [ ] `OPENWEATHERMAP_API_KEY`
- [ ] 本番用の `NEXTAUTH_SECRET`
- [ ] 本番ドメインの OAuth設定

---

## トラブルシューティング

### 1. Vertex AI認証エラー

**エラー**: `Error: Could not load the default credentials`

**解決策**：
```bash
# ADCを設定
gcloud auth application-default login

# または
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

---

### 2. Google OAuth エラー

**エラー**: `redirect_uri_mismatch`

**解決策**：
- Google Cloud ConsoleでリダイレクトURIを確認
- `http://localhost:3000/api/auth/callback/google` が登録されているか確認

---

### 3. Database接続エラー

**エラー**: `Can't reach database server`

**解決策**：
```bash
# PostgreSQLが起動しているか確認
docker ps | grep postgres

# 接続テスト
psql postgresql://postgres:password@localhost:5432/yoppy_dev
```

---

### 4. Gemini APIレート制限

**エラー**: `429 Resource exhausted`

**解決策**：
- 無料プランの制限を確認（15 RPM）
- 有料プランへのアップグレード
- リクエスト間隔を空ける

---

## セキュリティベストプラクティス

### 1. .envファイルをGitに含めない

```bash
# .gitignore に追加（既に含まれているはず）
.env
.env.local
.env.production
```

### 2. 本番環境では環境変数をホスティングプラットフォームで管理

**Vercel**：
- Settings → Environment Variables

**Netlify**：
- Site settings → Environment variables

**Railway**：
- Variables タブ

### 3. シークレットのローテーション

- 定期的にAPIキーを更新
- 漏洩した場合は即座に再生成

---

## クイックリファレンス

### 環境変数の優先順位

1. `.env.production.local` (本番、Gitに含めない)
2. `.env.local` (開発、Gitに含めない)
3. `.env.production` (本番、デフォルト)
4. `.env` (全環境、デフォルト)

### 推奨ファイル構成

```
your-project/
├── .env.example           # サンプル（Git管理）
├── .env.local.example     # 開発用サンプル（Git管理）
├── .env.production.example # 本番用サンプル（Git管理）
├── .env.local             # 実際の開発環境変数（Git除外）
├── .env.production        # 実際の本番環境変数（Git除外）
└── .gitignore             # .env* を除外
```

---

## 参考リンク

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vertex AI Setup Guide](https://cloud.google.com/vertex-ai/docs/start/cloud-environment)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)

---

**これで環境変数のセットアップは完了です！🎉**
