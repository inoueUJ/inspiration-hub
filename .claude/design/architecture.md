# アーキテクチャ設計書

## 概要

Inspiration Hubは、Next.js 15 App RouterとReact Server Componentsを活用した名言管理・配信Webアプリケーションです。Cloudflare Workers上で動作し、D1データベースを使用します。

## システムアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  (React Server/Client Components)               │
├─────────────────────────────────────────────────┤
│           Application Layer                     │
│  (Business Logic / Use Cases)                   │
├─────────────────────────────────────────────────┤
│           Data Access Layer                     │
│  (Drizzle ORM / Database Queries)               │
├─────────────────────────────────────────────────┤
│           Infrastructure Layer                  │
│  (Cloudflare D1 / Edge Runtime)                 │
└─────────────────────────────────────────────────┘
```

### ディレクトリ構造詳細

```
src/
├── app/                                    # Next.js App Router
│   ├── (public)/                          # 公開ページグループ (共通レイアウト)
│   │   ├── layout.tsx                     # 公開ページ共通レイアウト
│   │   ├── page.tsx                       # TOP (日替わり名言)
│   │   ├── category/
│   │   │   └── [id]/
│   │   │       ├── page.tsx               # 大カテゴリページ
│   │   │       ├── subcategories/
│   │   │       │   └── page.tsx           # 中項目リストページ
│   │   │       ├── loading.tsx            # ローディングUI
│   │   │       ├── error.tsx              # エラーUI
│   │   │       └── not-found.tsx          # 404 UI
│   │   ├── subcategory/
│   │   │   └── [id]/
│   │   │       └── page.tsx               # 中項目ページ
│   │   └── author/
│   │       └── [id]/
│   │           └── page.tsx               # 人物ページ
│   ├── admin/                             # 管理画面グループ (認証必須)
│   │   ├── layout.tsx                     # 管理画面共通レイアウト
│   │   ├── login/
│   │   │   └── page.tsx                   # ログインページ
│   │   └── dashboard/
│   │       ├── page.tsx                   # ダッシュボード
│   │       ├── quotes/                    # 名言管理
│   │       │   ├── page.tsx               # 一覧
│   │       │   ├── new/
│   │       │   │   └── page.tsx           # 新規作成
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx       # 編集
│   │       ├── categories/                # カテゴリ管理
│   │       ├── subcategories/             # 中項目管理
│   │       └── authors/                   # 人物管理
│   ├── api/                               # API Routes
│   │   ├── admin/
│   │   │   └── login/
│   │   │       └── route.ts               # 認証API
│   │   ├── categories/
│   │   │   ├── route.ts                   # 一覧・作成
│   │   │   └── [id]/
│   │   │       └── route.ts               # 取得・更新・削除
│   │   ├── subcategories/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── authors/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── quotes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── daily-quotes/
│   │   │   └── route.ts                   # 日替わり名言取得
│   │   ├── search/
│   │   │   └── route.ts                   # 検索API
│   │   ├── submissions/                   # 名言投稿API (将来機能)
│   │   │   ├── route.ts                   # 投稿一覧・作成
│   │   │   └── [id]/
│   │   │       └── route.ts               # 承認・却下・編集
│   │   ├── author-images/                 # 著者画像API (将来機能)
│   │   │   ├── route.ts                   # 画像一覧・アップロード
│   │   │   └── [id]/
│   │   │       └── route.ts               # 画像更新・削除
│   │   └── recommendations/               # AI推薦API (将来機能)
│   │       └── route.ts                   # ユーザーへの推薦名言取得
│   ├── layout.tsx                         # ルートレイアウト
│   ├── globals.css                        # グローバルスタイル
│   └── not-found.tsx                      # グローバル404
│
├── components/                            # 共有コンポーネント
│   ├── ui/                                # shadcn/uiコンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── features/                          # 機能別コンポーネント
│   │   ├── quote/                         # 名言関連
│   │   │   ├── quote-card.tsx             # 名言カード (Server)
│   │   │   ├── quote-grid.tsx             # 名言グリッド (Client)
│   │   │   ├── quote-dialog.tsx           # 名言ダイアログ (Client)
│   │   │   ├── quote-list-skeleton.tsx    # スケルトン
│   │   │   └── quote-form.tsx             # 名言フォーム (Admin)
│   │   ├── search/                        # 検索関連
│   │   │   ├── search-bar.tsx             # 検索バー (Client)
│   │   │   └── search-results.tsx         # 検索結果
│   │   ├── category/                      # カテゴリ関連
│   │   │   ├── category-list.tsx
│   │   │   ├── category-card.tsx
│   │   │   └── subcategory-list.tsx
│   │   └── author/                        # 人物関連
│   │       ├── author-list.tsx
│   │       └── author-card.tsx
│   └── layouts/                           # レイアウトコンポーネント
│       ├── header.tsx                     # ヘッダー (Server)
│       ├── footer.tsx                     # フッター (Server)
│       ├── navigation.tsx                 # ナビゲーション (Client)
│       └── sidebar.tsx                    # サイドバー (Admin)
│
├── lib/                                   # 共有ライブラリ
│   ├── api/                               # API関連
│   │   ├── response.ts                    # レスポンスヘルパー
│   │   ├── error.ts                       # エラークラス
│   │   └── validation.ts                  # Zodスキーマ
│   ├── auth/                              # 認証関連
│   │   ├── middleware.ts                  # 認証ミドルウェア
│   │   └── session.ts                     # セッション管理
│   ├── db/                                # データベース関連
│   │   ├── client.ts                      # DBクライアント
│   │   ├── schema.ts                      # スキーマ定義
│   │   ├── queries/                       # クエリ関数
│   │   │   ├── categories.ts
│   │   │   ├── quotes.ts
│   │   │   ├── authors.ts
│   │   │   ├── daily-quotes.ts
│   │   │   ├── submissions.ts            # 将来機能
│   │   │   ├── author-images.ts          # 将来機能
│   │   │   ├── users.ts                  # 将来機能
│   │   │   └── recommendations.ts        # 将来機能
│   │   └── migrations/                    # マイグレーション
│   ├── hooks/                             # カスタムフック (Client)
│   │   ├── use-quote-dialog.ts
│   │   ├── use-search.ts
│   │   └── use-infinite-scroll.ts
│   └── utils/                             # ユーティリティ関数
│       ├── cn.ts                          # classNames helper
│       ├── format-date.ts
│       └── constants.ts
│
└── types/                                 # 型定義
    ├── quote.ts                           # 名言型
    ├── category.ts                        # カテゴリ型
    ├── author.ts                          # 人物型
    └── api.ts                             # APIレスポンス型
```

## データベース設計

### 実装済みテーブル（基本機能）

#### 1. categories (大カテゴリ)
```typescript
id: integer (PK)
name: text (UNIQUE)
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp (Soft Delete)
```
**用途**: 偉人、アニメ、映画などの最上位カテゴリ

#### 2. subcategories (中項目)
```typescript
id: integer (PK)
categoryId: integer (FK → categories.id)
name: text
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```
**用途**: カテゴリ内の詳細分類（例：偉人→哲学者、数学者）

#### 3. authors (人物)
```typescript
id: integer (PK)
name: text (UNIQUE)
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```
**用途**: 名言の著者・キャラクター情報

#### 4. quotes (名言)
```typescript
id: integer (PK)
text: text (原文)
textJa: text (日本語翻訳、任意)
authorId: integer (FK → authors.id)
subcategoryId: integer (FK → subcategories.id)
background: text (背景説明、任意)
createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```
**用途**: 名言本体と関連メタデータ

#### 5. daily_quotes (日替わり名言)
```typescript
id: integer (PK)
date: text (YYYY-MM-DD形式)
quoteId: integer (FK → quotes.id)
createdAt: timestamp
```
**重要**: `(date, quoteId)` の複合UNIQUE制約により、1日30件の名言を保存可能

**用途**: Cloudflare Cron Triggers で毎日0時（UTC）にランダム30件を生成

#### 6. sessions (認証用)
```typescript
id: integer (PK)
token: text (UNIQUE)
expiresAt: timestamp
createdAt: timestamp
```
**用途**: 管理画面用のCookieベース認証

### 将来機能テーブル（設計完了、実装予定）

#### 7. author_images (著者画像)
```typescript
id: integer (PK)
authorId: integer (FK → authors.id)
imageUrl: text (Cloudflare R2 URL)
imageType: text ("profile" | "icon" | "background")
isPrimary: boolean (デフォルト: false)
altText: text (アクセシビリティ用、任意)
displayOrder: integer (デフォルト: 0)
createdAt: timestamp
deletedAt: timestamp
```
**用途**:
- Cloudflare R2に保存された著者の画像を管理
- 1人の著者に複数枚の画像を紐付け可能
- プロフィール画像、アイコン、背景画像など用途別に管理

**実装時の考慮事項**:
- Cloudflare R2へのアップロードAPI実装
- 画像最適化（Next.js Image Optimization）
- 主画像（isPrimary）の排他制御

#### 8. quote_submissions (ユーザー投稿名言)
```typescript
id: integer (PK)

// 投稿内容
text: text
textJa: text (任意)
authorName: text (既存著者名 or 新規著者名)
categoryName: text (任意)
subcategoryName: text (任意)
background: text (任意)

// 投稿者情報（匿名可）
submitterEmail: text (任意)
submitterName: text (任意)
submitterIp: text (スパム対策用)

// 審査ステータス
status: text ("pending" | "approved" | "rejected" | "editing")

// 管理者による編集
editedText: text (任意)
editedTextJa: text (任意)
editedAuthorName: text (任意)
editedCategoryName: text (任意)
editedSubcategoryName: text (任意)
editedBackground: text (任意)
adminFeedback: text (添削コメント・却下理由)

// 承認情報
reviewedBy: text (管理者名)
reviewedAt: timestamp
approvedQuoteId: integer (FK → quotes.id, SET NULL)

createdAt: timestamp
updatedAt: timestamp
deletedAt: timestamp
```
**用途**:
- 一般ユーザーが名言を投稿（匿名可）
- 管理者が承認・編集・添削するワークフロー
- 承認後は `quotes` テーブルに正式登録

**ワークフロー**:
1. ユーザー投稿 → `status: "pending"`
2. 管理者が編集開始 → `status: "editing"`
3. 承認 → `status: "approved"`, `approvedQuoteId` にリンク
4. 却下 → `status: "rejected"`, `adminFeedback` に理由記載

**セキュリティ考慮事項**:
- IPアドレスのハッシュ化（GDPR対応）
- レート制限（同一IPからの連続投稿防止）
- バリデーション強化（XSS対策）

#### 9. users (ユーザー - AI推薦用)
```typescript
id: integer (PK)
userId: text (UUID, UNIQUE)
email: text (UNIQUE, 任意)
preferences: text (JSON形式)
createdAt: timestamp
lastActiveAt: timestamp
deletedAt: timestamp
```
**用途**:
- 匿名ユーザーにもUUIDを割り当て（Cookie/LocalStorage）
- カテゴリ嗜好、好きな著者などをJSON形式で保存
- AI推薦エンジンのためのユーザープロファイル

**preferences JSONスキーマ例**:
```json
{
  "favoriteCategories": [1, 3, 5],
  "favoriteAuthors": [2, 7, 12],
  "preferredLanguage": "ja",
  "theme": "dark"
}
```

#### 10. user_quote_interactions (ユーザー行動履歴 - AI推薦用)
```typescript
id: integer (PK)
userId: integer (FK → users.id)
quoteId: integer (FK → quotes.id)
interactionType: text ("like" | "view" | "share" | "favorite")
createdAt: timestamp
```
**用途**:
- ユーザーの行動履歴を記録
- AI推薦エンジンの学習データとして活用
- 人気の名言、トレンド分析にも利用可能

**推奨される最適化**:
- `(userId, quoteId, interactionType)` 複合UNIQUE制約
- `userId`, `quoteId`, `createdAt` にインデックス
- 古いデータの定期削除（6ヶ月以上前など）

### テーブル間のリレーション

```
categories (1) ─┬─ (N) subcategories
                │
subcategories (1) ─── (N) quotes
                │
authors (1) ─────┼─── (N) quotes
                │      │
                │      ├─── (N) daily_quotes
                │      │
                │      └─── (N) user_quote_interactions
                │
                └─── (N) author_images

users (1) ──── (N) user_quote_interactions

quote_submissions (1) ─── (0-1) quotes (approvedQuoteId)
```

## Server Components vs Client Components

### 判断基準フローチャート

```
コンポーネントを作成する
        │
        ▼
以下のいずれかが必要？
- useState / useReducer
- useEffect
- イベントハンドラ (onClick, etc.)
- ブラウザAPI (localStorage, etc.)
- カスタムフック (useXxx)
        │
    ┌───┴───┐
   Yes      No
    │        │
    ▼        ▼
Client    Server
Component Component
```

### Server Components (デフォルト)

**使用場面:**
- データフェッチング（DB、外部API）
- 静的コンテンツのレンダリング
- SEO重視のコンテンツ
- サーバーサイドロジック
- 環境変数への直接アクセス

**例:**
```tsx
// src/components/features/quote/quote-card.tsx
import { Quote } from '@/types/quote'
import Link from 'next/link'

interface QuoteCardProps {
  quote: Quote
}

// "use client" なし = Server Component
export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-2 flex gap-2 text-sm text-muted-foreground">
        <Link
          href={`/subcategory/${quote.subcategoryId}`}
          className="hover:underline"
        >
          {quote.subcategory.name}
        </Link>
        <span>•</span>
        <Link
          href={`/author/${quote.authorId}`}
          className="hover:underline"
        >
          {quote.author.name}
        </Link>
      </div>
      <p className="text-lg">{quote.textJa || quote.text}</p>
    </div>
  )
}
```

### Client Components ("use client")

**使用場面:**
- ユーザーインタラクション
- State管理
- イベントハンドリング
- ブラウザAPI使用
- リアルタイム更新

**例:**
```tsx
// src/components/features/quote/quote-grid.tsx
"use client"

import { useState } from 'react'
import { Quote } from '@/types/quote'
import { QuoteCard } from './quote-card' // Server Component を利用
import { QuoteDialog } from './quote-dialog'

interface QuoteGridProps {
  quotes: Quote[]
}

export function QuoteGrid({ quotes }: QuoteGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            onClick={() => setSelectedIndex(index)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <QuoteCard quote={quote} />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <QuoteDialog
          quotes={quotes}
          initialIndex={selectedIndex}
          open={selectedIndex !== null}
          onOpenChange={(open) => !open && setSelectedIndex(null)}
        />
      )}
    </>
  )
}
```

## Composition Pattern

Server ComponentsとClient Componentsを組み合わせる最適なパターン

### パターン1: Server Component → Client Component (データ渡し)

```tsx
// src/app/(public)/page.tsx (Server Component)
import { getDailyQuotes } from '@/lib/db/queries/daily-quotes'
import { QuoteGrid } from '@/components/features/quote/quote-grid'

export default async function HomePage() {
  // Server Componentでデータ取得
  const quotes = await getDailyQuotes()

  // Client Componentにデータを渡す
  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">今日の名言</h1>
      <QuoteGrid quotes={quotes} />
    </main>
  )
}
```

### パターン2: Client Component内でServer Componentを使用

```tsx
// src/components/features/quote/quote-grid.tsx (Client Component)
"use client"

import { useState } from 'react'
import { QuoteCard } from './quote-card' // Server Component

export function QuoteGrid({ quotes }) {
  const [selectedIndex, setSelectedIndex] = useState(null)

  return (
    <div className="grid grid-cols-2 gap-4">
      {quotes.map((quote, index) => (
        <div key={quote.id} onClick={() => setSelectedIndex(index)}>
          {/* Server Componentを子として使用 */}
          <QuoteCard quote={quote} />
        </div>
      ))}
    </div>
  )
}
```

### パターン3: Slots Pattern (children経由)

```tsx
// src/app/(public)/layout.tsx (Server Component)
import { Header } from '@/components/layouts/header'
import { MobileNav } from '@/components/layouts/mobile-nav' // Client Component

export default function PublicLayout({ children }) {
  return (
    <div>
      <Header /> {/* Server Component */}
      <MobileNav> {/* Client Component */}
        {children} {/* Server Component (pages) */}
      </MobileNav>
    </div>
  )
}
```

## データフェッチング戦略

### Server Componentsでの直接フェッチ（推奨）

```tsx
// src/app/(public)/category/[id]/page.tsx
import { db } from '@/lib/db/client'
import { getCategoryWithSubcategories } from '@/lib/db/queries/categories'

interface PageProps {
  params: { id: string }
}

export default async function CategoryPage({ params }: PageProps) {
  // Server Componentで直接DBクエリ
  const category = await getCategoryWithSubcategories(parseInt(params.id))

  if (!category) {
    notFound()
  }

  return (
    <div>
      <h1>{category.name}</h1>
      {/* ... */}
    </div>
  )
}

// キャッシング設定
export const revalidate = 3600 // 1時間キャッシュ
```

### API Routes経由（Client Componentsから）

```tsx
// src/components/features/search/search-bar.tsx
"use client"

import { useState, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Quote } from '@/types/quote'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Quote[]>([])
  const debouncedQuery = useDebounce(query, 300)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([])
      return
    }

    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
    const data = await res.json()
    setResults(data.data)
  }, [])

  useEffect(() => {
    handleSearch(debouncedQuery)
  }, [debouncedQuery, handleSearch])

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="名言・作者を検索"
      />
      <SearchResults results={results} />
    </div>
  )
}
```

### Parallel Data Fetching

```tsx
// src/app/(public)/category/[id]/page.tsx
export default async function CategoryPage({ params }: PageProps) {
  // 並列でデータ取得
  const [category, authors, quoteCount] = await Promise.all([
    getCategory(params.id),
    getAuthorsByCategory(params.id),
    getQuoteCountByCategory(params.id),
  ])

  return (/* ... */)
}
```

### Sequential Data Fetching

```tsx
// 依存関係がある場合は順次取得
export default async function Page({ params }: PageProps) {
  const category = await getCategory(params.id)

  // categoryの結果に依存
  const subcategories = await getSubcategories(category.id)

  return (/* ... */)
}
```

### 将来機能のデータフェッチングパターン

#### ユーザー投稿名言の管理画面クエリ
```tsx
// src/lib/db/queries/submissions.ts
import { db } from '../client'
import { quoteSubmissions } from '../schema'
import { eq, isNull, desc } from 'drizzle-orm'

/**
 * 承認待ち投稿を取得
 */
export async function getPendingSubmissions() {
  return await db
    .select()
    .from(quoteSubmissions)
    .where(
      and(
        eq(quoteSubmissions.status, 'pending'),
        isNull(quoteSubmissions.deletedAt)
      )
    )
    .orderBy(desc(quoteSubmissions.createdAt))
}

/**
 * 投稿を承認して quotes テーブルに追加
 */
export async function approveSubmission(
  submissionId: number,
  reviewedBy: string
) {
  const [submission] = await db
    .select()
    .from(quoteSubmissions)
    .where(eq(quoteSubmissions.id, submissionId))

  if (!submission) return null

  // 1. quotes テーブルに新規レコード作成
  const [newQuote] = await db
    .insert(quotes)
    .values({
      text: submission.editedText || submission.text,
      textJa: submission.editedTextJa || submission.textJa,
      authorId: /* 著者IDの取得・作成ロジック */,
      subcategoryId: /* サブカテゴリIDの取得・作成ロジック */,
      background: submission.editedBackground || submission.background,
    })
    .returning()

  // 2. 投稿ステータスを更新
  const [updated] = await db
    .update(quoteSubmissions)
    .set({
      status: 'approved',
      approvedQuoteId: newQuote.id,
      reviewedBy,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(quoteSubmissions.id, submissionId))
    .returning()

  return { submission: updated, quote: newQuote }
}
```

#### 著者画像の取得と管理
```tsx
// src/lib/db/queries/author-images.ts
import { db } from '../client'
import { authorImages, authors } from '../schema'
import { eq, isNull, and, desc } from 'drizzle-orm'

/**
 * 著者の全画像を取得（表示順にソート）
 */
export async function getAuthorImages(authorId: number) {
  return await db
    .select()
    .from(authorImages)
    .where(
      and(
        eq(authorImages.authorId, authorId),
        isNull(authorImages.deletedAt)
      )
    )
    .orderBy(desc(authorImages.isPrimary), authorImages.displayOrder)
}

/**
 * 著者のプライマリ画像を取得
 */
export async function getPrimaryAuthorImage(authorId: number) {
  const [image] = await db
    .select()
    .from(authorImages)
    .where(
      and(
        eq(authorImages.authorId, authorId),
        eq(authorImages.isPrimary, true),
        isNull(authorImages.deletedAt)
      )
    )
    .limit(1)

  return image
}

/**
 * 画像をプライマリに設定（他の画像のプライマリフラグを解除）
 */
export async function setPrimaryImage(imageId: number, authorId: number) {
  // トランザクション処理
  await db.transaction(async (tx) => {
    // 1. 同じ著者の全画像のプライマリフラグを解除
    await tx
      .update(authorImages)
      .set({ isPrimary: false })
      .where(eq(authorImages.authorId, authorId))

    // 2. 指定画像をプライマリに設定
    await tx
      .update(authorImages)
      .set({ isPrimary: true })
      .where(eq(authorImages.id, imageId))
  })
}
```

#### AI推薦のためのユーザー行動記録
```tsx
// src/lib/db/queries/recommendations.ts
import { db } from '../client'
import { userQuoteInteractions, users, quotes } from '../schema'
import { eq, and, desc, sql } from 'drizzle-orm'

/**
 * ユーザーの行動を記録
 */
export async function recordInteraction(
  userId: number,
  quoteId: number,
  interactionType: 'like' | 'view' | 'share' | 'favorite'
) {
  const [interaction] = await db
    .insert(userQuoteInteractions)
    .values({
      userId,
      quoteId,
      interactionType,
    })
    .returning()

  // ユーザーの lastActiveAt を更新
  await db
    .update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, userId))

  return interaction
}

/**
 * ユーザーが「いいね」した名言を取得
 */
export async function getUserLikedQuotes(userId: number, limit = 30) {
  return await db
    .select({
      quote: quotes,
      likedAt: userQuoteInteractions.createdAt,
    })
    .from(userQuoteInteractions)
    .innerJoin(quotes, eq(quotes.id, userQuoteInteractions.quoteId))
    .where(
      and(
        eq(userQuoteInteractions.userId, userId),
        eq(userQuoteInteractions.interactionType, 'like')
      )
    )
    .orderBy(desc(userQuoteInteractions.createdAt))
    .limit(limit)
}

/**
 * 人気の名言を取得（いいね数ベース）
 */
export async function getPopularQuotes(limit = 30) {
  return await db
    .select({
      quote: quotes,
      likeCount: sql<number>`count(*)`,
    })
    .from(quotes)
    .innerJoin(
      userQuoteInteractions,
      eq(userQuoteInteractions.quoteId, quotes.id)
    )
    .where(eq(userQuoteInteractions.interactionType, 'like'))
    .groupBy(quotes.id)
    .orderBy(desc(sql`count(*)`))
    .limit(limit)
}

/**
 * ユーザーの嗜好に基づく推薦（簡易版）
 * 本格的なAI推薦は将来実装
 */
export async function getRecommendedQuotes(userId: number, limit = 10) {
  // 1. ユーザーがいいねした名言のカテゴリを取得
  const likedCategories = await db
    .select({ categoryId: subcategories.categoryId })
    .from(userQuoteInteractions)
    .innerJoin(quotes, eq(quotes.id, userQuoteInteractions.quoteId))
    .innerJoin(subcategories, eq(subcategories.id, quotes.subcategoryId))
    .where(
      and(
        eq(userQuoteInteractions.userId, userId),
        eq(userQuoteInteractions.interactionType, 'like')
      )
    )
    .groupBy(subcategories.categoryId)
    .limit(3)

  const categoryIds = likedCategories.map((c) => c.categoryId)

  // 2. 同じカテゴリのまだ見ていない名言をランダムに取得
  return await db
    .select()
    .from(quotes)
    .innerJoin(subcategories, eq(subcategories.id, quotes.subcategoryId))
    .where(
      and(
        inArray(subcategories.categoryId, categoryIds),
        // まだインタラクションしていない名言
        notExists(
          db
            .select()
            .from(userQuoteInteractions)
            .where(
              and(
                eq(userQuoteInteractions.userId, userId),
                eq(userQuoteInteractions.quoteId, quotes.id)
              )
            )
        )
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(limit)
}
```

## キャッシング戦略

### Page Level Caching

```tsx
// src/app/(public)/page.tsx
export const revalidate = 0 // 常に最新データ (日替わりなので)

// src/app/(public)/category/[id]/page.tsx
export const revalidate = 3600 // 1時間キャッシュ

// src/app/(public)/author/[id]/page.tsx
export const dynamic = 'force-static' // ビルド時に静的生成
export const revalidate = 86400 // 24時間キャッシュ
```

### API Route Caching

```tsx
// src/app/api/categories/route.ts
export const revalidate = 3600

export async function GET() {
  const categories = await db.query.categories.findMany()
  return successResponse(categories)
}
```

### Fetch Caching

```tsx
// デフォルトキャッシュ
const data = await fetch('https://api.example.com/data')

// キャッシュなし
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// 10秒ごとに再検証
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 10 }
})
```

## エラーハンドリング

### Error Boundary

```tsx
// src/app/(public)/category/[id]/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>再試行</Button>
    </div>
  )
}
```

### Not Found

```tsx
// src/app/(public)/category/[id]/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">カテゴリが見つかりません</h2>
      <Link href="/" className="text-primary hover:underline">
        トップページに戻る
      </Link>
    </div>
  )
}
```

## Loading UI

```tsx
// src/app/(public)/category/[id]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}
```

## Cloudflare Workers特有の考慮事項

### 環境変数アクセス

```tsx
// src/lib/db/client.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { drizzle } from 'drizzle-orm/d1'

export async function getDb() {
  const { env } = await getCloudflareContext()
  return drizzle(env.DB)
}
```

### Edge Runtime制限

```tsx
// Node.js APIは使用不可
// ❌ import fs from 'fs'
// ❌ import crypto from 'crypto'

// Web Standard APIを使用
// ✅ Web Crypto API
// ✅ Fetch API
```

## パフォーマンス最適化

### Code Splitting

```tsx
// 動的インポート
import dynamic from 'next/dynamic'

const QuoteDialog = dynamic(
  () => import('@/components/features/quote/quote-dialog'),
  {
    loading: () => <DialogSkeleton />,
    ssr: false, // Client Componentのみの場合
  }
)
```

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/images/author.jpg"
  alt="Author name"
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Bundle Size最適化

- tree-shakingを意識したインポート
- 重いライブラリの使用を避ける
- 必要な部分のみインポート

```tsx
// ❌ 悪い例
import _ from 'lodash'

// ✅ 良い例
import { debounce } from 'lodash-es'
```

## セキュリティ

### 認証ミドルウェア

```tsx
// src/lib/auth/middleware.ts
export async function requireAuth(request: NextRequest) {
  const token = cookies().get('session_token')?.value

  if (!token) {
    throw new AppError('UNAUTHORIZED', '認証が必要です', 401)
  }

  const session = await verifySession(token)

  if (!session) {
    throw new AppError('UNAUTHORIZED', 'セッションが無効です', 401)
  }

  return session
}
```

### XSS対策

- Reactのデフォルトエスケープを活用
- `dangerouslySetInnerHTML`は使用しない
- ユーザー入力は必ずサニタイズ

### CSRF対策

- SameSite Cookie属性の設定
- CSRFトークンの使用（必要に応じて）

## テスト戦略（今後実装）

- Unit Tests: Vitest
- Component Tests: React Testing Library
- E2E Tests: Playwright
- API Tests: Supertest

## まとめ

このアーキテクチャは以下の原則に基づいています：

1. **Server Components優先**: パフォーマンスとSEOを最適化
2. **レイヤー分離**: 関心の分離とメンテナンス性向上
3. **型安全性**: TypeScript + Zodで堅牢性確保
4. **パフォーマンス**: Edge Runtime + キャッシング戦略
5. **保守性**: 明確なディレクトリ構造と命名規則
