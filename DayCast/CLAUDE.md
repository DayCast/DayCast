# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 絶対に守るルール


### コード品質
- **ファイル分割**: 1,000行超は機能別に分割
- **class禁止**: 原則使用禁止（Error継承など特殊ケースのみ許可）
- **any/unknown禁止**: TypeScriptで使用不可
- **SOLID原則**: 単一責任・依存性注入・インターフェース分離

### Git ワークフロー
- **develop/main への直接コミット・プッシュ禁止**: 必ずフィーチャーブランチを作成してPR経由でマージ
- ブランチ命名規則: `feat/`, `fix/`, `refactor/`, `docs/` など

### 並列 Worktree の提案
以下の場合、ユーザーに worktree による並列作業を提案すること（詳細: `docs/development/worktree-guide.md`）:
- **複数の独立タスクが同時に提示された場合** — 各タスクを別worktreeで並列実行する手順を提示
- **作業中に別の緊急タスクが割り込んだ場合** — 現在の作業を中断せず、新しいworktreeで対応する手順を提示

提案時は `wt-add` / `wt-go` の具体的なコマンド例を含めること。不要な場合（単一タスク、依存関係がある等）は提案しない。

### PRマージ後のブランチ操作
PRをマージした後に別ブランチで作業する場合、**必ず**以下の手順を踏むこと：

```bash
# 1. developに移動して最新取得
git checkout develop
git pull origin develop

# 2. マージ済みブランチ削除（推奨）
git branch -d <merged-branch-name>

# 3. 作業ブランチに移動してリベース（/rebase スキルを使用）
git checkout <target-branch>
/rebase
```

**禁止**: PRマージ後に `git checkout <other-branch>` だけで移動すること（developの最新変更が反映されず不整合が起きる）

### TDD（テスト駆動開発）
このプロジェクトでは **tdd-guard** が有効化されており、テストなしの実装はブロックされます。

**必須フロー:**
1. **テストを先に書く** - `tests/` 配下にテストファイルを作成
2. **テスト実行で失敗を確認** - `uv run pytest tests/path/to/test.py -v`
3. **最小限の実装を書く** - テストを通すために必要な最小限のコード
4. **テスト成功を確認** - 再度テスト実行

**例:**
```python
# 1. まずテストを書く (tests/unit/services/api/example/test_calculator.py)
def test_adds_two_numbers() -> None:
    from app.services.api.example.calculator import add
    assert add(2, 3) == 5

# 2. テスト実行 → ImportError で失敗

# 3. 実装を書く (src/app/services/api/example/calculator.py)
def add(a: int, b: int) -> int:
    return a + b

# 4. テスト実行 → 成功
```

**注意**: 実装ファイルを先に作成しようとすると tdd-guard によりブロックされます。

## Commands

### Docker Commands（推奨）
```bash
# 開発環境起動
docker compose up -d

# コード品質チェック
docker compose exec app uv run ruff check src/
docker compose exec app uv run ruff check --fix src/
docker compose exec app uv run mypy src/

# テスト
docker compose exec app uv run pytest
docker compose exec app uv run pytest tests/test_specific.py
docker compose exec app uv run pytest -k "test_function_name"

# マイグレーション
docker compose exec app uv run alembic upgrade head
docker compose exec app uv run alembic revision --autogenerate -m "description"

# ログ・デバッグ
docker compose logs app -f
docker compose logs worker -f
docker compose restart app  # コード変更後に実行して反映
```

**注意**: ブランチ切り替え・コード変更後は `docker compose restart app` で変更を反映すること

### ローカル実行（Docker外）
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
uv run pytest
uv run ruff check src/
uv run mypy src/
```


### 主要機能
・天気の情報やカレンダー、todoリスト、登録サイトの情報から必要なものを推測し、通知してくれるアプリ
・やることリストを渡して優先順位を設定してくれるアプリ




## External Dependencies

| サービス | 用途 |
|---------|------|
| Supabase | ユーザー認証 |
| OpenAI | GPT-4o, embeddings |
| Vertex AI Gemini | 代替AIプロバイダー |
| Vertex AI Search | エンタープライズ検索、RAG |
| Document AI | PDF解析、OCR |
| PostgreSQL | データストレージ |
| DeepEval / RAGAS / SelfCheckGPT | RAG評価 |
| Safety Guard / PyRit | セキュリティ評価 |
| SendGrid | メール送信 |
| Cloud Run Jobs | 本番Workerジョブ |


### Git Hooks Setup
```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

Pre-commit: GitLeaks, Ruff, MyPy, Conventional Commits

