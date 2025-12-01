# CLAUDE.md - Inspiration Hub

Claude Code（claude.ai/code）がこのプロジェクトを理解するためのメイン設定ファイルです。

## プロジェクト概要

**Inspiration Hub** は、偉人やアニメキャラクター、映画キャラクターの名言をまとめ、ユーザーの自己啓発を支援するWebアプリケーションです。

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

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# DBスキーマ反映
npm run db:push

# DB GUI
npm run db:studio

# デプロイ
npm run deploy
```

## 重要なファイル構造

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

## コーディング規約

### TypeScript

- **常に TypeScript を使用** - `any` 型は禁止
- **明示的な型指定** - 関数の戻り値は明示的に型を指定
- **Drizzle ORM の型推論を活用** - `$inferSelect` / `$inferInsert`
- **Zod スキーマで入出力を検証** - API リクエスト / レスポンスの型チェック

### Server Components / Client Components

- **デフォルトはServer Components** - すべてのコンポーネントはデフォルトでServer Componentsとして実装
- **Client Componentsは最小限** - インタラクティビティが必要な部分のみ `"use client"` を使用
- **Composition Pattern** - Client ComponentsをServer Componentsでラップして配置

```tsx
// ❌ 悪い例: ページ全体をClient Componentに
"use client"
export default function Page() {
  const [state, setState] = useState()
  return <div><Header /><Content /></div>
}

// ✅ 良い例: 必要な部分のみClient Component
export default function Page() {
  return (
    <div>
      <Header /> {/* Server Component */}
      <InteractiveContent /> {/* Client Component */}
    </div>
  )
}
```

### バリデーション

- Zodスキーマで入力を検証
- APIリクエスト/レスポンスは必ず型チェック

### Soft Delete

- データの物理削除は行わない
- `deletedAt` に日時を設定して論理削除
- 読み取りクエリでは `isNull(table.deletedAt)` でフィルタ

### エラーハンドリング

- try-catchで適切に処理
- エラーログは `console.error` で記録
- `successResponse` / `errorResponse` を使用

## ファイル命名規則

- **コンポーネント**: `kebab-case.tsx` (例: `quote-card.tsx`)
- **ユーティリティ**: `kebab-case.ts` (例: `format-date.ts`)
- **コンポーネント名**: PascalCase (例: `QuoteCard`, `SearchBar`)
- **関数名**: camelCase (例: `getDailyQuotes`, `formatDate`)
- **定数名**: UPPER_SNAKE_CASE (例: `MAX_QUOTES_PER_DAY`)

## Drizzle ORM パターン

### CREATE

```typescript
const [newQuote] = await db
  .insert(quotes)
  .values({ text: "...", authorId: 1, subcategoryId: 1 })
  .returning();
```

### READ

```typescript
// 全件（削除済み除外）
const allQuotes = await db
  .select()
  .from(quotes)
  .where(isNull(quotes.deletedAt));

// 単件
const [quote] = await db
  .select()
  .from(quotes)
  .where(eq(quotes.id, id));
```

### UPDATE

```typescript
const [updated] = await db
  .update(quotes)
  .set({ text: "新しいテキスト", updatedAt: new Date() })
  .where(eq(quotes.id, id))
  .returning();
```

### DELETE (Soft Delete)

```typescript
const [deleted] = await db
  .update(quotes)
  .set({ deletedAt: new Date() })
  .where(eq(quotes.id, id))
  .returning();
```

## API Route パターン

```typescript
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const data = await db.select().from(quotes);
    return successResponse(data);
  } catch (error) {
    console.error("Error:", error);
    return errorResponse("INTERNAL_ERROR", "エラーが発生しました");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createQuoteSchema.parse(body);
    
    const [newQuote] = await db
      .insert(quotes)
      .values(validated)
      .returning();
    
    return successResponse(newQuote, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "バリデーションエラー");
    }
    return errorResponse("INTERNAL_ERROR", "作成に失敗しました");
  }
}
```

## Cloudflare Workers 環境変数アクセス

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  const { env } = await getCloudflareContext()
  const db = env.DB // D1 Database
  const password = env.ADMIN_PASSWORD // 環境変数

  // 処理
}
```

## データモデル

### 基本機能（実装済み）

```
categories（大カテゴリ）
├─ id, name, createdAt, updatedAt, deletedAt

subcategories（中項目）
├─ id, categoryId (FK), name, createdAt, updatedAt, deletedAt

authors（人物）
├─ id, name, createdAt, updatedAt, deletedAt

quotes（名言）
├─ id, text, textJa, authorId (FK), subcategoryId (FK), background, createdAt, updatedAt, deletedAt

daily_quotes（日替わり30件）
├─ id, date, quoteId (FK), createdAt
├─ 注: (date, quoteId) の複合UNIQUE制約により、1日30件の名言を保存可能

sessions（認証用）
├─ id, token, expiresAt, createdAt
```

### 将来機能（設計完了、実装予定）

```
author_images（著者画像）
├─ id, authorId (FK), imageUrl, imageType, isPrimary, altText, displayOrder
├─ createdAt, deletedAt
├─ 用途: Cloudflare R2に保存された画像URL、1人の著者に複数枚の画像を紐付け

quote_submissions（ユーザー投稿）
├─ id, text, textJa, authorName, categoryName, subcategoryName, background
├─ submitterEmail, submitterName, submitterIp
├─ status (pending/approved/rejected/editing)
├─ editedText, editedTextJa, editedAuthorName, editedCategoryName, editedSubcategoryName, editedBackground
├─ adminFeedback, reviewedBy, reviewedAt, approvedQuoteId (FK)
├─ createdAt, updatedAt, deletedAt
├─ 用途: ユーザーが名言を投稿、管理者が承認・編集・添削

users（ユーザー - AI推薦用）
├─ id, userId (UUID), email, preferences (JSON)
├─ createdAt, lastActiveAt, deletedAt
├─ 用途: 匿名ユーザーにもUUIDを割り当て、嗜好を保存

user_quote_interactions（ユーザー行動履歴 - AI推薦用）
├─ id, userId (FK), quoteId (FK), interactionType (like/view/share/favorite)
├─ createdAt
├─ 用途: AI推薦エンジンのためのデータ収集
```

## 禁止事項

1. ❌ `any` 型の使用
2. ❌ ページコンポーネント全体を `"use client"` にする
3. ❌ Server Components から Client Components へ関数を渡す
4. ❌ 不必要な `useEffect` の使用
5. ❌ インラインスタイル（Tailwindを使用）
6. ❌ `console.log` のコミット（開発時のみ使用）
7. ❌ 未処理例外（必ず try-catch で処理）
8. ❌ ブラウザから DB への直接接続

## 推奨事項

1. ✅ Server Componentsを優先的に使用
2. ✅ Composition Patternの活用
3. ✅ 型安全性の確保（Zod + TypeScript）
4. ✅ アクセシビリティの考慮
5. ✅ エラーハンドリングの実装
6. ✅ Loading UIの提供
7. ✅ SEO対策（metadata設定）

## 詳細ドキュメント

より詳細な情報は以下のドキュメントを参照してください：

- [アーキテクチャ設計書](.claude/design/architecture.md)
- [コーディング規約](.claude/design/coding-standards.md)
- [コンポーネント設計](.claude/design/components.md)
- [データフェッチング戦略](.claude/design/data-fetching.md)
- [shadcn/ui ガイド](.claude/design/shadcn-ui.md)
- [プロジェクト概要](ARCHITECTURE.md)
