# コンポーネント設計書

## コンポーネント設計原則

### 1. Single Responsibility Principle（単一責任の原則）
各コンポーネントは1つの責任のみを持つ

### 2. Composition over Inheritance（継承より合成）
小さなコンポーネントを組み合わせて複雑なUIを構築

### 3. Props Drilling回避
深いネストが必要な場合はComposition Patternを使用

### 4. Server Components優先
デフォルトはServer Component、必要な場合のみClient Component

## コンポーネントカテゴリ

### UI Components (`src/components/ui/`)
shadcn/uiベースの再利用可能な基本コンポーネント

- **特徴**: ステートレス、プレゼンテーション専用
- **例**: Button, Card, Dialog, Input, Skeleton

```tsx
// src/components/ui/button.tsx (shadcn/ui生成)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Feature Components (`src/components/features/`)
機能別の特化したコンポーネント

#### Quote Components (`src/components/features/quote/`)

##### QuoteCard (Server Component)
```tsx
// src/components/features/quote/quote-card.tsx
import { Quote } from '@/types/quote'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

interface QuoteCardProps {
  quote: Quote
  variant?: 'default' | 'compact'
  showCategory?: boolean
}

/**
 * 名言カード - Server Component
 * データ表示のみでインタラクティビティなし
 */
export function QuoteCard({
  quote,
  variant = 'default',
  showCategory = true,
}: QuoteCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className={variant === 'compact' ? 'p-4' : 'p-6'}>
        {showCategory && (
          <div className="mb-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link
              href={`/subcategory/${quote.subcategoryId}`}
              className="hover:text-primary hover:underline"
            >
              {quote.subcategory.name}
            </Link>
            <span>•</span>
            <Link
              href={`/author/${quote.authorId}`}
              className="hover:text-primary hover:underline"
            >
              {quote.author.name}
            </Link>
          </div>
        )}
        <p className={variant === 'compact' ? 'text-base' : 'text-lg'}>
          {quote.textJa || quote.text}
        </p>
      </CardContent>
    </Card>
  )
}
```

##### QuoteGrid (Client Component)
```tsx
// src/components/features/quote/quote-grid.tsx
"use client"

import { useState, useCallback } from 'react'
import { Quote } from '@/types/quote'
import { QuoteCard } from './quote-card'
import { QuoteDialog } from './quote-dialog'

interface QuoteGridProps {
  quotes: Quote[]
}

/**
 * 名言グリッド - Client Component
 * クリックイベントとダイアログ表示を管理
 */
export function QuoteGrid({ quotes }: QuoteGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleCardClick = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleDialogClose = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            onClick={() => handleCardClick(index)}
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
          onOpenChange={(open) => !open && handleDialogClose()}
        />
      )}
    </>
  )
}
```

##### QuoteDialog (Client Component)
```tsx
// src/components/features/quote/quote-dialog.tsx
"use client"

import { useState, useEffect } from 'react'
import { Quote } from '@/types/quote'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface QuoteDialogProps {
  quotes: Quote[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 名言ダイアログ - Client Component
 * 前後ナビゲーション機能付き
 */
export function QuoteDialog({
  quotes,
  initialIndex,
  open,
  onOpenChange,
}: QuoteDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const currentQuote = quotes[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : quotes.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < quotes.length - 1 ? prev + 1 : 0))
  }

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handlePrev, handleNext])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap gap-2 text-base font-normal text-muted-foreground">
            <Link
              href={`/subcategory/${currentQuote.subcategoryId}`}
              className="hover:text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {currentQuote.subcategory.name}
            </Link>
            <span>•</span>
            <Link
              href={`/author/${currentQuote.authorId}`}
              className="hover:text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {currentQuote.author.name}
            </Link>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 名言本文 */}
          <div className="space-y-2">
            <p className="text-xl leading-relaxed">
              {currentQuote.textJa || currentQuote.text}
            </p>
            {currentQuote.textJa && currentQuote.text && (
              <p className="text-sm italic text-muted-foreground">
                {currentQuote.text}
              </p>
            )}
          </div>

          {/* 背景情報 */}
          {currentQuote.background && (
            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-semibold">背景</h4>
              <p className="text-sm text-muted-foreground">
                {currentQuote.background}
              </p>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={quotes.length <= 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              前へ
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {quotes.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={quotes.length <= 1}
            >
              次へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

##### QuoteListSkeleton (Server Component)
```tsx
// src/components/features/quote/quote-list-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function QuoteListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6">
          <div className="mb-2 flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  )
}
```

#### Search Components (`src/components/features/search/`)

##### SearchBar (Client Component)
```tsx
// src/components/features/search/search-bar.tsx
"use client"

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Quote } from '@/types/quote'

interface SearchBarProps {
  onResults: (results: Quote[]) => void
  onLoading?: (loading: boolean) => void
}

/**
 * 検索バー - Client Component
 * デバウンス付き検索機能
 */
export function SearchBar({ onResults, onLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        onResults([])
        return
      }

      try {
        onLoading?.(true)
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        )
        const data = await res.json()
        onResults(data.data || [])
      } catch (error) {
        console.error('Search error:', error)
        onResults([])
      } finally {
        onLoading?.(false)
      }
    },
    [onResults, onLoading]
  )

  useEffect(() => {
    handleSearch(debouncedQuery)
  }, [debouncedQuery, handleSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="名言・作者を検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
```

#### Category Components (`src/components/features/category/`)

##### CategoryCard (Server Component)
```tsx
// src/components/features/category/category-card.tsx
import { Category } from '@/types/category'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

interface CategoryCardProps {
  category: Category & {
    _count: {
      subcategories: number
      quotes: number
    }
  }
}

/**
 * カテゴリカード - Server Component
 */
export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${category.id}`}>
      <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{category.name}</CardTitle>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            {category._count.subcategories}個の中項目 •{' '}
            {category._count.quotes}件の名言
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
```

##### SubcategoryList (Server Component)
```tsx
// src/components/features/category/subcategory-list.tsx
import { Subcategory } from '@/types/category'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface SubcategoryListProps {
  subcategories: (Subcategory & {
    _count: {
      quotes: number
    }
  })[]
}

/**
 * 中項目リスト - Server Component
 */
export function SubcategoryList({ subcategories }: SubcategoryListProps) {
  return (
    <div className="space-y-2">
      {subcategories.map((subcategory) => (
        <Link
          key={subcategory.id}
          href={`/subcategory/${subcategory.id}`}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <span className="font-medium">{subcategory.name}</span>
          <Badge variant="secondary">
            {subcategory._count.quotes}件
          </Badge>
        </Link>
      ))}
    </div>
  )
}
```

#### Author Components (`src/components/features/author/`)

##### AuthorList (Server Component)
```tsx
// src/components/features/author/author-list.tsx
import { Author } from '@/types/author'
import Link from 'next/link'

interface AuthorListProps {
  authors: (Author & {
    _count: {
      quotes: number
    }
  })[]
}

/**
 * 人物リスト - Server Component
 */
export function AuthorList({ authors }: AuthorListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {authors.map((author) => (
        <Link
          key={author.id}
          href={`/author/${author.id}`}
          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <span className="font-medium">{author.name}</span>
          <span className="text-sm text-muted-foreground">
            {author._count.quotes}件
          </span>
        </Link>
      ))}
    </div>
  )
}
```

### Layout Components (`src/components/layouts/`)

##### Header (Server Component)
```tsx
// src/components/layouts/header.tsx
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * ヘッダー - Server Component
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">Inspiration Hub</span>
        </Link>

        <nav className="flex flex-1 items-center justify-end space-x-4">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            ホーム
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            カテゴリ
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

##### MobileNav (Client Component)
```tsx
// src/components/layouts/mobile-nav.tsx
"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

/**
 * モバイルナビゲーション - Client Component
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm font-medium"
          >
            ホーム
          </Link>
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="text-sm font-medium"
          >
            カテゴリ
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

## コンポーネント命名規則

### ファイル名
- `kebab-case.tsx`
- 例: `quote-card.tsx`, `search-bar.tsx`

### コンポーネント名
- `PascalCase`
- 例: `QuoteCard`, `SearchBar`

### Props型名
- `<ComponentName>Props`
- 例: `QuoteCardProps`, `SearchBarProps`

## Props設計

### Props型定義
```tsx
// 必須と任意を明確に
interface ComponentProps {
  // 必須Props
  id: string
  title: string

  // 任意Props
  description?: string
  onClick?: () => void

  // デフォルト値があるProps
  variant?: 'default' | 'compact'
  showDetails?: boolean

  // children
  children?: React.ReactNode
}
```

### Props Destructuring
```tsx
export function Component({
  id,
  title,
  description,
  variant = 'default',
  showDetails = true,
  onClick,
  children,
}: ComponentProps) {
  // 実装
}
```

## State管理

### Local State (useState)
```tsx
"use client"

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Quote[]>([])

  // ...
}
```

### Derived State
```tsx
// ❌ 悪い例: 不要なstate
const [filteredItems, setFilteredItems] = useState([])

useEffect(() => {
  setFilteredItems(items.filter(item => item.active))
}, [items])

// ✅ 良い例: 計算で導出
const filteredItems = items.filter(item => item.active)
```

### Lifting State Up
```tsx
// 親コンポーネントでstateを管理
export function ParentComponent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <ChildA selectedId={selectedId} onSelect={setSelectedId} />
      <ChildB selectedId={selectedId} />
    </>
  )
}
```

## カスタムフック

### use-debounce.ts
```tsx
// src/lib/hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### use-quote-dialog.ts
```tsx
// src/lib/hooks/use-quote-dialog.ts
"use client"

import { useState, useCallback } from 'react'

export function useQuoteDialog() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openDialog = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const closeDialog = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  return {
    selectedIndex,
    isOpen: selectedIndex !== null,
    openDialog,
    closeDialog,
  }
}
```

## エラーハンドリング

### Error Boundary
```tsx
// src/components/error-boundary.tsx
"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
            <Button onClick={() => this.setState({ hasError: false })}>
              再試行
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

## アクセシビリティ

### セマンティックHTML
```tsx
// ✅ 良い例
<nav>
  <ul>
    <li><Link href="/">Home</Link></li>
  </ul>
</nav>

// ❌ 悪い例
<div className="nav">
  <div className="link">Home</div>
</div>
```

### ARIAラベル
```tsx
<Button aria-label="検索">
  <Search className="h-4 w-4" />
</Button>

<input
  type="search"
  aria-label="名言を検索"
  placeholder="検索"
/>
```

### キーボードナビゲーション
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDialog()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [closeDialog])
```

## パフォーマンス最適化

### React.memo
```tsx
// 不要な再レンダリングを防ぐ
export const QuoteCard = React.memo(function QuoteCard({ quote }: QuoteCardProps) {
  // ...
})
```

### useCallback
```tsx
const handleClick = useCallback(() => {
  // クリックハンドラ
}, [dependencies])
```

### useMemo
```tsx
const filteredQuotes = useMemo(() => {
  return quotes.filter(q => q.authorId === authorId)
}, [quotes, authorId])
```

## まとめ

### コンポーネント設計チェックリスト

- [ ] Server ComponentかClient Componentか明確か？
- [ ] 単一責任の原則を守っているか？
- [ ] Props型は明確に定義されているか？
- [ ] 適切な命名規則を使用しているか？
- [ ] アクセシビリティは考慮されているか？
- [ ] エラーハンドリングは実装されているか？
- [ ] 不要な再レンダリングは防がれているか？
- [ ] TypeScriptの型安全性は確保されているか？
