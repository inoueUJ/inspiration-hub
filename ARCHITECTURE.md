# Inspiration Hub - アーキテクチャドキュメント

## 📌 プロジェクト概要

**Inspiration Hub** は、偉人やアニメキャラクター、映画キャラクターの名言をまとめ、ユーザーの自己啓発を支援するアプリケーションです。

- **ターゲット層**: 20〜40歳のユーザー
- **コンセプト**: 毎日変わる30件の名言で日々の刺激を提供
- **性質**: 非商用、学習目的のプロジェクト

---

## 🏗️ 技術スタック

### コア技術
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS

### インフラ（完全 Cloudflare ベース）
- **Runtime**: Cloudflare Workers
- **Deploy**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Batch Processing**: Cloudflare Cron Triggers (毎日 UTC 0時実行)
- **Adapter**: @opennextjs/cloudflare

### 認証・セッション
- **方式**: Cookie + Session (簡易パスワード)
- **対象**: 管理画面（`/admin` 配下）のみ
- **実装**: Next.js Middleware + HttpOnly Cookie

---

## 📁 ディレクトリ構造

```
inspiration-hub/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/route.ts
│   │   │   ├── subcategories/route.ts
│   │   │   ├── authors/route.ts
│   │   │   ├── quotes/route.ts
│   │   │   ├── daily-quotes/route.ts
│   │   │   └── admin/
│   │   │       └── login/route.ts
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── quotes/page.tsx
│   │   │   └── categories/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       ├── db/
│       │   ├── schema.ts
│       │   ├── client.ts
│       │   └── migrations/
│       ├── api/
│       │   ├── response.ts
│       │   ├── error.ts
│       │   └── validation.ts
│       ├── auth/
│       │   ├── middleware.ts
│       │   └── session.ts
│       └── utils/
├── ARCHITECTURE.md
├── .copilot-instructions.md
├── drizzle.config.ts
├── wrangler.jsonc
└── .dev.vars
```

---

## 🗄️ データモデル

### 基本機能テーブル（実装済み）

#### 1. categories (大カテゴリ)
- `id`, `name` (unique), `createdAt`, `updatedAt`, `deletedAt`

#### 2. subcategories (中項目)
- `id`, `categoryId` (FK), `name`, `createdAt`, `updatedAt`, `deletedAt`

#### 3. authors (人物)
- `id`, `name` (unique), `createdAt`, `updatedAt`, `deletedAt`

#### 4. quotes (名言)
- `id`, `text`, `textJa`, `authorId` (FK), `subcategoryId` (FK), `background`, `createdAt`, `updatedAt`, `deletedAt`

#### 5. daily_quotes (日替わり30件)
- `id`, `date` (YYYY-MM-DD), `quoteId` (FK), `createdAt`
- **重要:** `(date, quoteId)` の複合UNIQUE制約により、1日30件の名言を保存可能

#### 6. sessions (認証用)
- `id`, `token` (unique), `expiresAt`, `createdAt`

### 将来機能テーブル（設計完了、実装予定）

#### 7. author_images (著者画像)
- `id`, `authorId` (FK), `imageUrl`, `imageType`, `isPrimary`, `altText`, `displayOrder`, `createdAt`, `deletedAt`
- **用途:** Cloudflare R2に保存された画像、1人の著者に複数枚の画像を紐付け

#### 8. quote_submissions (ユーザー投稿)
- `id`, `text`, `textJa`, `authorName`, `categoryName`, `subcategoryName`, `background`
- `submitterEmail`, `submitterName`, `submitterIp`
- `status` (pending/approved/rejected/editing)
- `editedText`, `editedTextJa`, `editedAuthorName`, `editedCategoryName`, `editedSubcategoryName`, `editedBackground`
- `adminFeedback`, `reviewedBy`, `reviewedAt`, `approvedQuoteId` (FK)
- `createdAt`, `updatedAt`, `deletedAt`
- **用途:** 匿名ユーザーが名言を投稿、管理者が承認・編集・添削するワークフロー

#### 9. users (ユーザー - AI推薦用)
- `id`, `userId` (UUID, unique), `email` (unique), `preferences` (JSON)
- `createdAt`, `lastActiveAt`, `deletedAt`
- **用途:** 匿名ユーザーにもUUIDを割り当て、カテゴリ嗜好・好きな著者などを保存

#### 10. user_quote_interactions (ユーザー行動履歴 - AI推薦用)
- `id`, `userId` (FK), `quoteId` (FK), `interactionType` (like/view/share/favorite), `createdAt`
- **用途:** ユーザーの行動履歴を記録し、AI推薦エンジンの学習データとして活用

---

## 🎯 API 設計方針

### REST エンドポイント

#### カテゴリ
- `GET /api/categories` - 全カテゴリ取得
- `POST /api/categories` - カテゴリ作成（管理画面のみ）
- `PUT /api/categories/[id]` - 更新
- `DELETE /api/categories/[id]` - 削除

#### 中項目・人物・名言
- `GET /api/subcategories` - 取得
- `POST /api/subcategories` - 作成（管理画面のみ）
- `PUT /api/authors/[id]` - 更新
- `DELETE /api/quotes/[id]` - 削除

#### 日替わり名言
- `GET /api/daily-quotes` - 本日の30件を取得
- `GET /api/daily-quotes?date=YYYY-MM-DD` - 指定日の30件を取得

#### 認証
- `POST /api/admin/login` - ログイン
- `POST /api/admin/logout` - ログアウト

---

## 🔄 環境別設定

### 開発環境
- **DB**: `better-sqlite` + `./local.db`
- **マイグレーション**: `npm run db:push`

### 本番環境
- **DB**: Cloudflare D1 (d1-http)
- **デプロイ**: `npm run deploy`

---

**最終更新**: 2025-11-10
