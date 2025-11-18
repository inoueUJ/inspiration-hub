# コーディング規約

## TypeScript規約

### 型定義

#### 明示的な型指定

```typescript
// ✅ 良い例: 戻り値の型を明示
function getQuoteById(id: number): Promise<Quote | null> {
  return db.query.quotes.findFirst({ where: eq(quotes.id, id) })
}

// ❌ 悪い例: 型推論に頼りすぎ
function getQuoteById(id: number) {
  return db.query.quotes.findFirst({ where: eq(quotes.id, id) })
}
```

#### any型の禁止

```typescript
// ❌ 絶対禁止
function processData(data: any) {
  // ...
}

// ✅ unknown型を使用
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // 型ガードで安全に処理
  }
}

// ✅ ジェネリクスを使用
function processData<T>(data: T): T {
  return data
}
```

#### インターフェース vs 型エイリアス

```typescript
// ✅ オブジェクトの形状定義にはインターフェース
interface QuoteCardProps {
  quote: Quote
  variant?: 'default' | 'compact'
  onClick?: (quote: Quote) => void
}

// ✅ ユニオン型や複雑な型にはtype
type Status = 'idle' | 'loading' | 'success' | 'error'
type QuoteWithAuthor = Quote & { author: Author }
```

#### 型定義の配置

```typescript
// src/types/quote.ts
import { Quote as DbQuote, Author, Subcategory, Category } from '@/lib/db/schema'

// データベース型を拡張
export type Quote = DbQuote & {
  author: Author
  subcategory: Subcategory & {
    category: Category
  }
}

// コンポーネントProps型
export interface QuoteCardProps {
  quote: Quote
  variant?: 'default' | 'compact'
  showCategory?: boolean
}

// API レスポンス型
export interface QuoteResponse {
  data: Quote[]
  total: number
  page: number
}
```

### Null Safety

```typescript
// ✅ 良い例: Null チェック
const category = await getCategoryById(id)
if (!category) {
  notFound()
}
// この後は category が non-null であることが保証される

// ✅ オプショナルチェーン
const categoryName = quote.subcategory?.category?.name

// ✅ Null 合体演算子
const displayText = quote.textJa ?? quote.text

// ❌ 悪い例: 非 Null アサーション（使用を最小限に）
const category = await getCategoryById(id)!
```

### ジェネリクス

```typescript
// API レスポンス型
interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// 使用例
function successResponse<T>(data: T): ApiResponse<T> {
  return { data }
}

const response: ApiResponse<Quote[]> = successResponse(quotes)
```

## React/Next.js 規約

### コンポーネント定義

```typescript
// ✅ 良い例: 名前付き関数でエクスポート
export function QuoteCard({ quote, variant = 'default' }: QuoteCardProps) {
  return <div>{/* ... */}</div>
}

// ❌ 悪い例: アロー関数でのデフォルトエクスポート
const QuoteCard = ({ quote }) => {
  return <div>{/* ... */}</div>
}
export default QuoteCard
```

### Server Components / Client Components

```typescript
// Server Component（デフォルト）- ファイル先頭に何も書かない
export function QuoteCard({ quote }: QuoteCardProps) {
  return <div>{/* ... */}</div>
}

// Client Component - ファイル先頭に "use client"
"use client"

import { useState } from 'react'

export function QuoteDialog({ quotes }: QuoteDialogProps) {
  const [index, setIndex] = useState(0)
  return <div>{/* ... */}</div>
}
```

### Props の設計

```typescript
// ✅ 良い例: 明確な Props 型定義
interface QuoteCardProps {
  // 必須 Props
  quote: Quote

  // オプション Props（デフォルト値あり）
  variant?: 'default' | 'compact'
  showCategory?: boolean

  // イベントハンドラ
  onClick?: (quote: Quote) => void

  // children
  children?: React.ReactNode

  // HTML 属性（必要に応じて）
  className?: string
}

export function QuoteCard({
  quote,
  variant = 'default',
  showCategory = true,
  onClick,
  className,
}: QuoteCardProps) {
  // 実装
}
```

### State 管理

```typescript
// ✅ 良い例: 適切な初期値と型指定
const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
const [quotes, setQuotes] = useState<Quote[]>([])

// ✅ Derived State（計算で導出）
const filteredQuotes = quotes.filter(q => q.authorId === authorId)

// ❌ 悪い例: 不要な State
const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
useEffect(() => {
  setFilteredQuotes(quotes.filter(q => q.authorId === authorId))
}, [quotes, authorId])
```

### useEffect の使用

```typescript
// ✅ 良い例: 依存配列を正しく指定
useEffect(() => {
  async function fetchData() {
    const data = await getQuotes(categoryId)
    setQuotes(data)
  }
  fetchData()
}, [categoryId])

// ✅ クリーンアップ関数
useEffect(() => {
  const timer = setTimeout(() => {
    // 処理
  }, 1000)

  return () => clearTimeout(timer)
}, [])

// ❌ 悪い例: 依存配列の省略
useEffect(() => {
  setQuotes(getQuotes(categoryId))
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // categoryId が変更されても再実行されない
```

### イベントハンドラ

```typescript
// ✅ 良い例: useCallback でメモ化
const handleClick = useCallback((quote: Quote) => {
  setSelectedQuote(quote)
  onQuoteSelect?.(quote)
}, [onQuoteSelect])

// ✅ インライン関数（軽量な処理の場合）
<button onClick={() => setOpen(false)}>閉じる</button>

// ❌ 悪い例: 毎回新しい関数を生成（パフォーマンス問題）
<ExpensiveComponent onClick={(quote) => {
  // 重い処理
}} />
```

## 命名規則

### ファイル名

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx              # kebab-case
│   │   └── card.tsx
│   └── features/
│       └── quote/
│           ├── quote-card.tsx      # kebab-case
│           └── quote-dialog.tsx
├── lib/
│   ├── utils/
│   │   └── format-date.ts          # kebab-case
│   └── db/
│       └── queries/
│           └── daily-quotes.ts     # kebab-case
└── types/
    └── quote.ts                     # kebab-case
```

### コンポーネント名

```typescript
// PascalCase
export function QuoteCard() {}
export function SearchBar() {}
export function AuthorList() {}
```

### 関数名

```typescript
// camelCase
function getQuoteById() {}
function formatDate() {}
async function fetchDailyQuotes() {}

// イベントハンドラ: handle + イベント名
function handleClick() {}
function handleSubmit() {}
function handleChange() {}

// Boolean 値を返す: is/has/should + 形容詞
function isValid() {}
function hasQuotes() {}
function shouldShowDialog() {}
```

### 変数名

```typescript
// camelCase
const quoteList = []
const selectedIndex = 0
const isLoading = false

// Boolean: is/has/should + 形容詞
const isOpen = true
const hasError = false
const shouldRender = true
```

### 定数名

```typescript
// UPPER_SNAKE_CASE
const MAX_QUOTES_PER_DAY = 30
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_PAGE_SIZE = 20

// ファイル内定数
const DEBOUNCE_DELAY = 300
const CACHE_DURATION = 3600
```

### 型名

```typescript
// PascalCase
interface QuoteCardProps {}
type Status = 'idle' | 'loading' | 'success' | 'error'
type QuoteWithAuthor = Quote & { author: Author }

// Props 型: コンポーネント名 + Props
interface QuoteCardProps {}
interface SearchBarProps {}
```

## コード構成

### インポート順序

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// 2. 外部ライブラリ
import { z } from 'zod'
import { eq, isNull } from 'drizzle-orm'

// 3. 内部モジュール（絶対パス）
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getQuotes } from '@/lib/db/queries/quotes'
import { Quote } from '@/types/quote'

// 4. 相対パス
import { QuoteCard } from './quote-card'
import { useQuoteDialog } from '../hooks/use-quote-dialog'

// 5. スタイル/アセット
import './styles.css'
```

### コンポーネント内の順序

```typescript
"use client"

import { useState, useCallback, useEffect } from 'react'

// 1. 型定義
interface QuoteGridProps {
  quotes: Quote[]
}

// 2. コンポーネント定義
export function QuoteGrid({ quotes }: QuoteGridProps) {
  // 3. Hooks
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // 4. Computed values / Derived state
  const selectedQuote = selectedIndex !== null ? quotes[selectedIndex] : null

  // 5. Effects
  useEffect(() => {
    // ...
  }, [])

  // 6. Event handlers
  const handleClick = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  // 7. Render helpers（必要に応じて）
  const renderQuoteCard = (quote: Quote, index: number) => {
    return <QuoteCard key={quote.id} quote={quote} onClick={() => handleClick(index)} />
  }

  // 8. JSX return
  return (
    <div>
      {quotes.map(renderQuoteCard)}
    </div>
  )
}

// 9. サブコンポーネント（必要に応じて）
function QuoteCardWrapper({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

## コメント規約

### JSDoc コメント

```typescript
/**
 * 日替わり名言を取得
 * @param date YYYY-MM-DD形式の日付（省略時は今日）
 * @returns 指定日の名言30件
 * @throws {Error} データベースエラー時
 */
export async function getDailyQuotes(date?: string): Promise<Quote[]> {
  // 実装
}

/**
 * 名言カードコンポーネント
 *
 * Server Component として実装。
 * データ表示のみでインタラクティビティなし。
 */
export function QuoteCard({ quote }: QuoteCardProps) {
  // 実装
}
```

### インラインコメント

```typescript
// ✅ 良い例: 複雑なロジックの説明
const filteredQuotes = quotes.filter((quote) => {
  // 削除済みを除外
  if (quote.deletedAt) return false

  // カテゴリフィルタ適用
  if (categoryId && quote.subcategory.categoryId !== categoryId) {
    return false
  }

  return true
})

// ❌ 悪い例: 自明なコメント
const sum = a + b // a と b を足す
```

### TODO コメント

```typescript
// TODO: ページネーション実装
// FIXME: Edge ケースでエラーが発生
// HACK: 一時的な回避策、後で修正必要
// NOTE: 重要な注意事項
```

## エラーハンドリング

### Try-Catch

```typescript
// ✅ 良い例: 適切なエラーハンドリング
export async function GET(request: NextRequest) {
  try {
    const quotes = await getQuotes()
    return successResponse(quotes)
  } catch (error) {
    // エラーログ
    console.error('Failed to fetch quotes:', error)

    // 型に応じた処理
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    // 予期しないエラー
    return errorResponse('INTERNAL_ERROR', '予期しないエラーが発生しました', 500)
  }
}
```

### カスタムエラー

```typescript
// src/lib/api/error.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 使用例
if (!category) {
  throw new AppError('NOT_FOUND', 'カテゴリが見つかりません', 404)
}
```

## パフォーマンス最適化

### React.memo

```typescript
// ✅ 良い例: 重いコンポーネントをメモ化
export const QuoteCard = React.memo(function QuoteCard({ quote }: QuoteCardProps) {
  return <div>{/* ... */}</div>
})

// カスタム比較関数
export const QuoteCard = React.memo(
  function QuoteCard({ quote }: QuoteCardProps) {
    return <div>{/* ... */}</div>
  },
  (prevProps, nextProps) => {
    // quote.id が同じなら再レンダリング不要
    return prevProps.quote.id === nextProps.quote.id
  }
)
```

### useMemo

```typescript
// ✅ 良い例: 重い計算結果をメモ化
const filteredAndSortedQuotes = useMemo(() => {
  return quotes
    .filter(q => q.categoryId === categoryId)
    .sort((a, b) => b.createdAt - a.createdAt)
}, [quotes, categoryId])

// ❌ 悪い例: 軽い計算をメモ化（オーバーヘッド）
const displayText = useMemo(() => quote.textJa || quote.text, [quote])
```

### Dynamic Import

```typescript
// ✅ 重いコンポーネントを動的インポート
import dynamic from 'next/dynamic'

const QuoteDialog = dynamic(
  () => import('@/components/features/quote/quote-dialog'),
  {
    loading: () => <DialogSkeleton />,
    ssr: false, // Client Component のみの場合
  }
)
```

## セキュリティ

### XSS 対策

```typescript
// ✅ React のデフォルトエスケープを活用
<p>{quote.text}</p>

// ❌ dangerouslySetInnerHTML は使用しない
<div dangerouslySetInnerHTML={{ __html: quote.text }} />

// ✅ どうしても必要な場合は DOMPurify でサニタイズ
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### 環境変数

```typescript
// ✅ サーバーサイドでのみアクセス
const adminPassword = process.env.ADMIN_PASSWORD

// ✅ クライアントサイド用は NEXT_PUBLIC_ プレフィックス
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// ❌ クライアントコンポーネントで秘密情報にアクセス
"use client"
const secret = process.env.SECRET_KEY // undefined になる
```

### SQL インジェクション対策

```typescript
// ✅ Drizzle ORM のパラメータ化クエリを使用
const quote = await db.query.quotes.findFirst({
  where: eq(quotes.id, id)
})

// ❌ 文字列結合（絶対禁止）
const quote = await db.execute(
  sql`SELECT * FROM quotes WHERE id = ${id}` // 危険！
)
```

## テスト（今後実装）

### ファイル配置

```
src/
├── components/
│   └── features/
│       └── quote/
│           ├── quote-card.tsx
│           └── quote-card.test.tsx
└── lib/
    └── utils/
        ├── format-date.ts
        └── format-date.test.ts
```

### テストケース命名

```typescript
describe('QuoteCard', () => {
  it('should render quote text', () => {
    // ...
  })

  it('should show category when showCategory is true', () => {
    // ...
  })

  it('should call onClick when clicked', () => {
    // ...
  })
})
```

## Git コミットメッセージ

### フォーマット

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: ビルド、設定変更

### 例

```
feat: Add quote dialog component

- Implement QuoteDialog with prev/next navigation
- Add keyboard navigation support
- Add loading skeleton

Closes #123
```

## コードレビューチェックリスト

### 全般
- [ ] TypeScript の型は適切か？
- [ ] any 型を使用していないか？
- [ ] エラーハンドリングは実装されているか？

### React/Next.js
- [ ] Server Component / Client Component は適切か？
- [ ] 不要な再レンダリングは発生しないか？
- [ ] useEffect の依存配列は正しいか？
- [ ] イベントハンドラはメモ化されているか（必要に応じて）？

### パフォーマンス
- [ ] 不要な State は存在しないか？
- [ ] 重い計算は useMemo でメモ化されているか？
- [ ] 動的インポートは適切に使用されているか？

### セキュリティ
- [ ] XSS 対策は実装されているか？
- [ ] 環境変数の扱いは適切か？
- [ ] SQL インジェクション対策は実装されているか？

### アクセシビリティ
- [ ] セマンティック HTML を使用しているか？
- [ ] ARIA ラベルは適切か？
- [ ] キーボードナビゲーションは実装されているか？

## まとめ

この規約に従うことで：

1. **型安全性**: TypeScript の恩恵を最大限に活用
2. **保守性**: 一貫性のあるコードで長期的な保守が容易
3. **パフォーマンス**: 最適化された高速なアプリケーション
4. **セキュリティ**: 安全なコード実装
5. **可読性**: チーム開発に適した読みやすいコード

必ず各項目を確認してからコードをコミットしてください。
