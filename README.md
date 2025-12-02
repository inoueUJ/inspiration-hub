# Inspiration Hub

偉人やアニメキャラクター、映画キャラクターの名言をまとめ、ユーザーの自己啓発を支援するWebアプリケーションです。

## プロジェクト概要

- **ターゲット層**: 20〜40歳のユーザー
- **コンセプト**: 毎日変わる30件の名言で日々の刺激を提供
- **性質**: 非商用、学習目的のプロジェクト

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Runtime**: React 19 (Server Components優先)
- **Database**: SQLite (Cloudflare D1)
- **ORM**: Drizzle ORM
- **Deployment**: Cloudflare Workers (OpenNext)
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui
- **Validation**: Zod

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.dev.vars` ファイルを作成して、必要な環境変数を設定します：

```bash
# .dev.vars
DATABASE_URL="local.db"
ADMIN_PASSWORD="your-admin-password"
```

### 3. データベースのセットアップ

```bash
# スキーマをデータベースに反映
npm run db:push

# データベースにシードデータを投入
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## よく使うコマンド

### 開発

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# ビルド
npm run build
```

### データベース

```bash
# スキーマをデータベースに反映
npm run db:push

# マイグレーションファイルを生成
npm run db:generate

# Drizzle Studio を起動（DBのGUI）
npm run db:studio

# シードデータを投入
npm run db:seed
```

### デプロイ

```bash
# Cloudflare Workersにデプロイ
npm run deploy

# プレビュー環境で確認
npm run preview

# Cloudflare環境の型定義を生成
npm run cf-typegen
```

## デプロイ手順

### 前提条件

- Cloudflareアカウントを作成済み
- Wranglerでログイン済み（`npx wrangler login`）
- D1データベースを作成済み

### 1. D1データベースの作成

```bash
# D1データベースを作成
npx wrangler d1 create inspiration-hub

# wrangler.toml に D1バインディングを追加
# （プロジェクトルートに wrangler.toml がない場合は作成）
```

`wrangler.toml` の例：

```toml
name = "inspiration-hub"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "inspiration-hub"
database_id = "your-database-id"

[vars]
DATABASE_URL = "local.db"

[[triggers]]
crons = ["0 0 * * *"]
```

### 2. 環境変数の設定

```bash
# Cloudflare Workersに環境変数を設定
npx wrangler secret put ADMIN_PASSWORD
```

### 3. データベースのセットアップ

```bash
# D1データベースにスキーマを反映
npx wrangler d1 execute inspiration-hub --remote --file=./migrations/schema.sql

# または Drizzle を使用
npm run db:push
```

### 4. デプロイ

```bash
# ビルドしてデプロイ
npm run deploy
```

デプロイが完了すると、以下のような出力が表示されます：

```
Deployed inspiration-hub triggers (0.94 sec)
  https://inspiration-hub.your-subdomain.workers.dev
  schedule: 0 0 * * *
```

### 5. 本番データベースへのシード投入

```bash
# 本番環境のD1にシードデータを投入する場合
# （スクリプトを適宜修正してください）
npx wrangler d1 execute inspiration-hub --remote --file=./seed.sql
```

## 主要機能

### 日替わり名言（Daily Quotes）

- 毎日30件の名言を自動生成
- Cloudflare Workers の Cron Triggers で毎日午前0時に実行
- APIエンドポイント: `/api/daily-quotes`

### カテゴリ別閲覧

- 大カテゴリ（例：歴史、アニメ、映画）
- 中項目（例：日本の歴史、アメリカの歴史）
- 人物別

### 検索機能

- 名言のテキスト検索
- 著者名検索
- カテゴリ・中項目での絞り込み

## プロジェクト構成

```
src/
├── app/                          # App Router pages
│   ├── (public)/                 # 公開ページグループ
│   │   ├── page.tsx              # TOP (日替わり名言)
│   │   ├── category/[id]/        # カテゴリページ
│   │   ├── subcategory/[id]/     # 中項目ページ
│   │   └── author/[id]/          # 人物ページ
│   ├── admin/                    # 管理画面 (認証必須)
│   │   ├── login/
│   │   └── dashboard/
│   └── api/                      # API Routes
├── components/                   # 共有コンポーネント
│   ├── ui/                       # shadcn/ui コンポーネント
│   ├── features/                 # 機能別コンポーネント
│   └── layouts/                  # レイアウトコンポーネント
├── lib/                          # 共有ライブラリ
│   ├── api/                      # API ユーティリティ
│   ├── auth/                     # 認証関連
│   ├── db/                       # データベース関連
│   └── utils/                    # ヘルパー関数
└── types/                        # TypeScript 型定義
```

## データモデル

### 基本エンティティ

- **categories**: 大カテゴリ（歴史、アニメ、映画など）
- **subcategories**: 中項目（日本の歴史、アメリカの歴史など）
- **authors**: 人物（偉人、キャラクターなど）
- **quotes**: 名言
- **daily_quotes**: 日替わり30件の名言
- **sessions**: 認証セッション

詳細なスキーマは [src/lib/db/schema.ts](src/lib/db/schema.ts) を参照してください。

## コーディング規約

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

主なポイント：

- Server Components を優先的に使用
- `any` 型の使用禁止
- Soft Delete パターンの採用
- Zod スキーマによるバリデーション
- 明示的な型指定

## ドキュメント

より詳細な情報は以下のドキュメントを参照してください：

- [CLAUDE.md](CLAUDE.md) - Claude Code用の設定ファイル
- [ARCHITECTURE.md](ARCHITECTURE.md) - プロジェクト概要
- [.claude/design/](/.claude/design/) - 詳細設計ドキュメント

## ライセンス

このプロジェクトは学習目的の非商用プロジェクトです。

## トラブルシューティング

### ビルドエラー

型エラーが発生した場合：

```bash
# 型チェックを実行
npx tsc --noEmit

# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### データベース接続エラー

```bash
# ローカルDBファイルを削除して再作成
rm local.db
npm run db:push
npm run db:seed
```

### デプロイエラー

```bash
# Wranglerでログイン状態を確認
npx wrangler whoami

# 再ログイン
npx wrangler login

# D1データベースの確認
npx wrangler d1 list
```

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
