# GitHub Copilot Instructions - Inspiration Hub

## プロジェクト概要
偉人やアニメキャラクター、映画キャラクターの名言をまとめ、自己啓発に活用するWebアプリケーション

## 技術スタック
- **Framework**: Next.js 15.4.6 (App Router)
- **Runtime**: React 19 (Server Components優先)
- **Database**: SQLite (Cloudflare D1)
- **ORM**: Drizzle ORM
- **Deployment**: Cloudflare Workers (OpenNext)
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui
- **Validation**: Zod
- **Language**: TypeScript (Strict mode)

## アーキテクチャ原則

### 1. Server Components ファースト
- **デフォルトはServer Components**: すべてのコンポーネントはデフォルトでServer Componentsとして実装
- **Client Componentsは最小限**: インタラクティビティが必要な部分のみ`"use client"`を使用
- **Composition Pattern**: Client ComponentsをServer Componentsでラップして配置

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

### 2. ディレクトリ構造
```
src/
├── app/                          # App Router pages
│   ├── (public)/                 # Public pages group
│   │   ├── page.tsx              # TOP page
│   │   ├── category/[id]/        # Category pages
│   │   ├── subcategory/[id]/     # Subcategory pages
│   │   └── author/[id]/          # Author pages
│   ├── admin/                    # Admin pages (protected)
│   │   ├── login/
│   │   └── dashboard/
│   ├── api/                      # API Routes
│   ├── layout.tsx
│   └── globals.css
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui components
│   ├── features/                 # Feature-specific components
│   │   ├── quote/                # Quote-related components
│   │   │   ├── quote-card.tsx    # Server Component
│   │   │   ├── quote-card-interactive.tsx  # Client Component
│   │   │   └── quote-dialog.tsx  # Client Component
│   │   ├── search/
│   │   └── category/
│   └── layouts/                  # Layout components
├── lib/                          # Shared utilities
│   ├── api/                      # API utilities
│   ├── auth/                     # Authentication
│   ├── db/                       # Database
│   └── utils/                    # Helper functions
└── types/                        # TypeScript type definitions
```

### 3. コンポーネント設計パターン

#### Server Components (デフォルト)
- データフェッチング
- 静的コンテンツのレンダリング
- SEO対策が必要な部分
- サーバーサイドのみのロジック

```tsx
// src/components/features/quote/quote-card.tsx
import { Quote } from '@/types/quote'
import Link from 'next/link'

interface QuoteCardProps {
  quote: Quote
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex gap-2 text-sm text-muted-foreground">
        <Link href={`/subcategory/${quote.subcategoryId}`}>
          {quote.subcategory.name}
        </Link>
        <Link href={`/author/${quote.authorId}`}>
          {quote.author.name}
        </Link>
      </div>
      <p className="mt-2">{quote.textJa || quote.text}</p>
    </div>
  )
}
```

#### Client Components (use client)
- イベントハンドラ (onClick, onChange, etc.)
- State管理 (useState, useReducer)
- Effects (useEffect)
- ブラウザAPI (localStorage, etc.)
- カスタムフック

```tsx
// src/components/features/quote/quote-dialog.tsx
"use client"

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Quote } from '@/types/quote'

interface QuoteDialogProps {
  quotes: Quote[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteDialog({ quotes, initialIndex, open, onOpenChange }: QuoteDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : quotes.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < quotes.length - 1 ? prev + 1 : 0))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  )
}
```

#### Composition Pattern
```tsx
// src/app/(public)/page.tsx (Server Component)
import { QuoteGrid } from '@/components/features/quote/quote-grid'
import { getDailyQuotes } from '@/lib/api/quotes'

export default async function HomePage() {
  const quotes = await getDailyQuotes()

  return (
    <main>
      <QuoteGrid quotes={quotes} /> {/* Client Component */}
    </main>
  )
}

// src/components/features/quote/quote-grid.tsx (Client Component)
"use client"

import { useState } from 'react'
import { QuoteCard } from './quote-card' // Server Component
import { QuoteDialog } from './quote-dialog'

export function QuoteGrid({ quotes }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {quotes.map((quote, index) => (
          <div key={quote.id} onClick={() => setSelectedIndex(index)}>
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

### 4. データフェッチング戦略

#### Server Componentsでのデータ取得
```tsx
// src/app/(public)/category/[id]/page.tsx
import { db } from '@/lib/db/client'
import { categories, authors } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

export default async function CategoryPage({ params }: { params: { id: string } }) {
  // Server Componentで直接DBクエリ
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, parseInt(params.id)),
    with: {
      subcategories: {
        where: isNull(subcategories.deletedAt),
      },
    },
  })

  return <div>{/* Render */}</div>
}

// キャッシング設定
export const revalidate = 3600 // 1時間ごとに再検証
```

#### API Routesの使用基準
- Client Componentsからのデータ取得が必要な場合
- フォーム送信などのミューテーション
- 外部APIのプロキシ
- Webhookエンドポイント

```tsx
// src/app/api/search/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db/client'
import { quotes } from '@/lib/db/schema'
import { like, or } from 'drizzle-orm'
import { successResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return successResponse([])
  }

  const results = await db.query.quotes.findMany({
    where: or(
      like(quotes.text, `%${query}%`),
      like(quotes.textJa, `%${query}%`)
    ),
    limit: 30,
  })

  return successResponse(results)
}

// Client Componentから使用
"use client"
export function SearchBar() {
  const [results, setResults] = useState([])

  const handleSearch = async (query: string) => {
    const res = await fetch(`/api/search?q=${query}`)
    const data = await res.json()
    setResults(data.data)
  }

  return (/* ... */)
}
```

### 5. Tailwind CSS & shadcn/ui

#### Tailwind CSS使用規則
- **ユーティリティファースト**: カスタムCSSは最小限に
- **レスポンシブ**: モバイルファースト (sm:, md:, lg:)
- **ダークモード対応**: `dark:` プレフィックスを使用

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Card className="p-4 hover:shadow-lg transition-shadow dark:bg-slate-800">
    {/* Content */}
  </Card>
</div>
```

#### shadcn/ui使用方針
- **コンポーネントのカスタマイズ**: `src/components/ui/` で管理
- **テーマ設定**: `globals.css` でCSS変数を定義
- **アクセシビリティ**: shadcn/uiのデフォルトを活用

### 6. TypeScript使用規則

#### 型定義
```tsx
// src/types/quote.ts
import { Quote as DbQuote, Author, Subcategory } from '@/lib/db/schema'

export type Quote = DbQuote & {
  author: Author
  subcategory: Subcategory & {
    category: Category
  }
}

// Props型定義
export interface QuoteCardProps {
  quote: Quote
  variant?: 'default' | 'compact'
  onClick?: (quote: Quote) => void
}
```

#### Zodスキーマとの連携
```tsx
// src/lib/api/validation.ts
import { z } from 'zod'

export const createQuoteSchema = z.object({
  text: z.string().min(1).max(1000),
  textJa: z.string().max(1000).optional(),
  authorId: z.number().int().positive(),
  subcategoryId: z.number().int().positive(),
  background: z.string().max(2000).optional(),
})

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
```

### 7. パフォーマンス最適化

#### 画像最適化
```tsx
import Image from 'next/image'

<Image
  src="/author-portrait.jpg"
  alt="Author name"
  width={200}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

#### 動的インポート
```tsx
import dynamic from 'next/dynamic'

const QuoteDialog = dynamic(() => import('@/components/features/quote/quote-dialog'), {
  loading: () => <DialogSkeleton />,
})
```

#### Suspense & Streaming
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<QuoteListSkeleton />}>
      <QuoteList />
    </Suspense>
  )
}
```

### 8. エラーハンドリング

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
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  )
}

// src/app/(public)/category/[id]/not-found.tsx
export default function NotFound() {
  return <div>カテゴリが見つかりません</div>
}
```

### 9. 命名規則

#### ファイル名
- コンポーネント: `kebab-case.tsx` (例: `quote-card.tsx`)
- ユーティリティ: `kebab-case.ts` (例: `format-date.ts`)
- 型定義: `kebab-case.ts` (例: `quote-types.ts`)

#### コンポーネント名
- PascalCase (例: `QuoteCard`, `SearchBar`)

#### 関数名
- camelCase (例: `getDailyQuotes`, `formatDate`)

#### 定数名
- UPPER_SNAKE_CASE (例: `MAX_QUOTES_PER_DAY`)

### 10. コメント規則

```tsx
/**
 * 日替わり名言を取得
 * @param date YYYY-MM-DD形式の日付
 * @returns 指定日の名言30件
 */
export async function getDailyQuotes(date: string): Promise<Quote[]> {
  // 実装
}
```

## Cloudflare Workers特有の注意点

### 環境変数アクセス
```tsx
// src/app/api/example/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET() {
  const { env } = await getCloudflareContext()
  const db = env.DB // D1 Database
  const password = env.ADMIN_PASSWORD // 環境変数

  // 処理
}
```

### Edge Runtime最適化
- 重いライブラリの使用を避ける
- バンドルサイズに注意
- Node.js APIの使用を最小限に

## 禁止事項

1. ❌ ページコンポーネント全体を`"use client"`にする
2. ❌ Server Componentsから Client Componentsへ関数を渡す
3. ❌ 不必要なuseEffectの使用
4. ❌ インラインスタイル（Tailwindを使用）
5. ❌ any型の使用（unknown型を検討）
6. ❌ console.logのコミット（開発時のみ使用）

## 推奨事項

1. ✅ Server Componentsを優先的に使用
2. ✅ Composition Patternの活用
3. ✅ 型安全性の確保（Zod + TypeScript）
4. ✅ アクセシビリティの考慮
5. ✅ エラーハンドリングの実装
6. ✅ Loading UIの提供
7. ✅ SEO対策（metadata設定）

## 参考リソース

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
