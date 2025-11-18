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
│   │   └── search/
│   │       └── route.ts                   # 検索API
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
│   │   │   └── daily-quotes.ts
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
