# データフェッチング戦略書

## データフェッチング方針

### 基本原則

1. **Server Components優先**: データはできるだけServer Componentsで取得
2. **並列フェッチング**: 依存関係のないデータは並列で取得
3. **適切なキャッシング**: ページの性質に応じたキャッシュ戦略を適用
4. **エラーハンドリング**: すべてのデータ取得にエラー処理を実装

## データアクセス層の実装

### Database Query Functions (`src/lib/db/queries/`)

データアクセスロジックを集約し、再利用性を高める

#### Categories Queries
```typescript
// src/lib/db/queries/categories.ts
import { db } from '@/lib/db/client'
import { categories, subcategories, quotes } from '@/lib/db/schema'
import { eq, isNull, sql } from 'drizzle-orm'

/**
 * 全カテゴリを取得（削除済み除外）
 */
export async function getAllCategories() {
  return db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(categories.name)
}

/**
 * カテゴリIDで取得
 */
export async function getCategoryById(id: number) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .where(isNull(categories.deletedAt))
    .limit(1)

  return category
}

/**
 * カテゴリと中項目を取得（名言数含む）
 */
export async function getCategoryWithSubcategories(id: number) {
  const category = await db.query.categories.findFirst({
    where: (categories, { eq, and, isNull }) =>
      and(eq(categories.id, id), isNull(categories.deletedAt)),
    with: {
      subcategories: {
        where: isNull(subcategories.deletedAt),
        orderBy: (subcategories, { asc }) => [asc(subcategories.name)],
        with: {
          _count: {
            quotes: true,
          },
        },
      },
    },
  })

  return category
}

/**
 * カテゴリに属する全人物を取得（名言数含む）
 */
export async function getAuthorsByCategory(categoryId: number) {
  const result = await db
    .select({
      id: authors.id,
      name: authors.name,
      quoteCount: sql<number>`count(${quotes.id})`.as('quote_count'),
    })
    .from(authors)
    .innerJoin(quotes, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .where(
      and(
        eq(subcategories.categoryId, categoryId),
        isNull(authors.deletedAt),
        isNull(quotes.deletedAt)
      )
    )
    .groupBy(authors.id, authors.name)
    .orderBy(authors.name)

  return result
}
```

#### Quotes Queries
```typescript
// src/lib/db/queries/quotes.ts
import { db } from '@/lib/db/client'
import { quotes, authors, subcategories, categories } from '@/lib/db/schema'
import { eq, isNull, or, like } from 'drizzle-orm'

/**
 * 名言を詳細情報付きで取得
 */
export async function getQuoteWithDetails(id: number) {
  const quote = await db.query.quotes.findFirst({
    where: (quotes, { eq, and, isNull }) =>
      and(eq(quotes.id, id), isNull(quotes.deletedAt)),
    with: {
      author: true,
      subcategory: {
        with: {
          category: true,
        },
      },
    },
  })

  return quote
}

/**
 * 中項目IDで名言一覧を取得
 */
export async function getQuotesBySubcategory(subcategoryId: number) {
  return db.query.quotes.findMany({
    where: (quotes, { eq, and, isNull }) =>
      and(
        eq(quotes.subcategoryId, subcategoryId),
        isNull(quotes.deletedAt)
      ),
    with: {
      author: true,
      subcategory: {
        with: {
          category: true,
        },
      },
    },
    orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
  })
}

/**
 * 人物IDで名言一覧を取得
 */
export async function getQuotesByAuthor(authorId: number) {
  return db.query.quotes.findMany({
    where: (quotes, { eq, and, isNull }) =>
      and(eq(quotes.authorId, authorId), isNull(quotes.deletedAt)),
    with: {
      author: true,
      subcategory: {
        with: {
          category: true,
        },
      },
    },
    orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
  })
}

/**
 * カテゴリIDで名言一覧を取得
 */
export async function getQuotesByCategory(categoryId: number) {
  return db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(quotes)
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(
      and(
        eq(categories.id, categoryId),
        isNull(quotes.deletedAt),
        isNull(authors.deletedAt),
        isNull(subcategories.deletedAt)
      )
    )
    .orderBy(desc(quotes.createdAt))
}

/**
 * 名言・作者名で検索
 */
export async function searchQuotes(query: string) {
  return db.query.quotes.findMany({
    where: (quotes, { or, like, and, isNull }) =>
      and(
        or(
          like(quotes.text, `%${query}%`),
          like(quotes.textJa, `%${query}%`)
        ),
        isNull(quotes.deletedAt)
      ),
    with: {
      author: true,
      subcategory: {
        with: {
          category: true,
        },
      },
    },
    limit: 30,
  })
}
```

#### Daily Quotes Queries
```typescript
// src/lib/db/queries/daily-quotes.ts
import { db } from '@/lib/db/client'
import { dailyQuotes, quotes } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

/**
 * 日替わり名言を取得（特定日）
 */
export async function getDailyQuotes(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0]

  const result = await db
    .select({
      quote: quotes,
      author: authors,
      subcategory: subcategories,
      category: categories,
    })
    .from(dailyQuotes)
    .innerJoin(quotes, eq(dailyQuotes.quoteId, quotes.id))
    .innerJoin(authors, eq(quotes.authorId, authors.id))
    .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(eq(dailyQuotes.date, targetDate))

  return result
}

/**
 * 日替わり名言を生成（バッチ処理用）
 */
export async function generateDailyQuotes(date: string) {
  // 既存のデータを削除
  await db.delete(dailyQuotes).where(eq(dailyQuotes.date, date))

  // ランダムに30件選定
  const randomQuotes = await db
    .select({ id: quotes.id })
    .from(quotes)
    .where(isNull(quotes.deletedAt))
    .orderBy(sql`RANDOM()`)
    .limit(30)

  // daily_quotesに挿入
  const insertData = randomQuotes.map((q) => ({
    date,
    quoteId: q.id,
  }))

  await db.insert(dailyQuotes).values(insertData)

  return insertData.length
}
```

### 将来機能のクエリ実装

#### Author Images Queries
```typescript
// src/lib/db/queries/author-images.ts
import { db } from '@/lib/db/client'
import { authorImages } from '@/lib/db/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'

/**
 * 著者の全画像を取得（表示順にソート）
 */
export async function getAuthorImages(authorId: number) {
  return db
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
 * 画像をプライマリに設定（トランザクション）
 */
export async function setPrimaryImage(imageId: number, authorId: number) {
  await db.transaction(async (tx) => {
    // 同じ著者の全画像のプライマリフラグを解除
    await tx
      .update(authorImages)
      .set({ isPrimary: false })
      .where(eq(authorImages.authorId, authorId))

    // 指定画像をプライマリに設定
    await tx
      .update(authorImages)
      .set({ isPrimary: true })
      .where(eq(authorImages.id, imageId))
  })
}

/**
 * 画像を追加（Cloudflare R2 URL）
 */
export async function addAuthorImage(data: {
  authorId: number
  imageUrl: string
  imageType: 'profile' | 'icon' | 'background'
  altText?: string
  isPrimary?: boolean
}) {
  const [image] = await db.insert(authorImages).values(data).returning()
  return image
}
```

#### Quote Submissions Queries
```typescript
// src/lib/db/queries/submissions.ts
import { db } from '@/lib/db/client'
import { quoteSubmissions, quotes, authors, subcategories } from '@/lib/db/schema'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'

/**
 * 承認待ち投稿を取得
 */
export async function getPendingSubmissions(limit = 50) {
  return db
    .select()
    .from(quoteSubmissions)
    .where(
      and(
        eq(quoteSubmissions.status, 'pending'),
        isNull(quoteSubmissions.deletedAt)
      )
    )
    .orderBy(desc(quoteSubmissions.createdAt))
    .limit(limit)
}

/**
 * 投稿をステータス別に取得
 */
export async function getSubmissionsByStatus(
  status: 'pending' | 'approved' | 'rejected' | 'editing',
  limit = 50
) {
  return db
    .select()
    .from(quoteSubmissions)
    .where(
      and(
        eq(quoteSubmissions.status, status),
        isNull(quoteSubmissions.deletedAt)
      )
    )
    .orderBy(desc(quoteSubmissions.createdAt))
    .limit(limit)
}

/**
 * 投稿を作成（ユーザー投稿）
 */
export async function createSubmission(data: {
  text: string
  textJa?: string
  authorName: string
  categoryName?: string
  subcategoryName?: string
  background?: string
  submitterEmail?: string
  submitterName?: string
  submitterIp: string
}) {
  const [submission] = await db
    .insert(quoteSubmissions)
    .values(data)
    .returning()

  return submission
}

/**
 * 投稿を承認してquotesテーブルに追加（トランザクション）
 */
export async function approveSubmission(
  submissionId: number,
  reviewedBy: string,
  overrides?: {
    text?: string
    textJa?: string
    authorId: number
    subcategoryId: number
    background?: string
  }
) {
  return await db.transaction(async (tx) => {
    // 投稿を取得
    const [submission] = await tx
      .select()
      .from(quoteSubmissions)
      .where(eq(quoteSubmissions.id, submissionId))

    if (!submission) {
      throw new Error('Submission not found')
    }

    // quotesテーブルに新規レコード作成
    const [newQuote] = await tx
      .insert(quotes)
      .values({
        text: overrides?.text || submission.editedText || submission.text,
        textJa: overrides?.textJa || submission.editedTextJa || submission.textJa,
        authorId: overrides!.authorId,
        subcategoryId: overrides!.subcategoryId,
        background:
          overrides?.background ||
          submission.editedBackground ||
          submission.background,
      })
      .returning()

    // 投稿ステータスを更新
    const [updated] = await tx
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
  })
}

/**
 * 投稿を却下
 */
export async function rejectSubmission(
  submissionId: number,
  reviewedBy: string,
  adminFeedback: string
) {
  const [updated] = await db
    .update(quoteSubmissions)
    .set({
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date(),
      adminFeedback,
      updatedAt: new Date(),
    })
    .where(eq(quoteSubmissions.id, submissionId))
    .returning()

  return updated
}

/**
 * 投稿を編集モードに変更
 */
export async function editSubmission(
  submissionId: number,
  editedData: {
    editedText?: string
    editedTextJa?: string
    editedAuthorName?: string
    editedCategoryName?: string
    editedSubcategoryName?: string
    editedBackground?: string
  }
) {
  const [updated] = await db
    .update(quoteSubmissions)
    .set({
      ...editedData,
      status: 'editing',
      updatedAt: new Date(),
    })
    .where(eq(quoteSubmissions.id, submissionId))
    .returning()

  return updated
}

/**
 * IPアドレスごとの投稿数をカウント（スパム対策）
 */
export async function getSubmissionCountByIp(ip: string, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quoteSubmissions)
    .where(
      and(
        eq(quoteSubmissions.submitterIp, ip),
        sql`${quoteSubmissions.createdAt} > ${since}`
      )
    )

  return result.count
}
```

#### User & Recommendations Queries
```typescript
// src/lib/db/queries/users.ts
import { db } from '@/lib/db/client'
import { users, userQuoteInteractions, quotes, subcategories } from '@/lib/db/schema'
import { eq, and, isNull, desc, sql, inArray, notExists } from 'drizzle-orm'

/**
 * ユーザーをUUIDで取得または作成
 */
export async function getOrCreateUser(userId: string) {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1)

  if (existingUser) {
    // lastActiveAtを更新
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, existingUser.id))

    return existingUser
  }

  // 新規ユーザー作成
  const [newUser] = await db
    .insert(users)
    .values({
      userId,
      lastActiveAt: new Date(),
    })
    .returning()

  return newUser
}

/**
 * ユーザーの嗜好を更新
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, any>
) {
  const [updated] = await db
    .update(users)
    .set({
      preferences: JSON.stringify(preferences),
      lastActiveAt: new Date(),
    })
    .where(eq(users.userId, userId))
    .returning()

  return updated
}

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

  return interaction
}

/**
 * ユーザーが「いいね」した名言を取得
 */
export async function getUserLikedQuotes(userId: number, limit = 30) {
  return db
    .select({
      quote: quotes,
      likedAt: userQuoteInteractions.createdAt,
    })
    .from(userQuoteInteractions)
    .innerJoin(quotes, eq(quotes.id, userQuoteInteractions.quoteId))
    .where(
      and(
        eq(userQuoteInteractions.userId, userId),
        eq(userQuoteInteractions.interactionType, 'like'),
        isNull(quotes.deletedAt)
      )
    )
    .orderBy(desc(userQuoteInteractions.createdAt))
    .limit(limit)
}

/**
 * 人気の名言を取得（いいね数ベース）
 */
export async function getPopularQuotes(limit = 30) {
  return db
    .select({
      quote: quotes,
      likeCount: sql<number>`count(*)`.as('like_count'),
    })
    .from(quotes)
    .innerJoin(
      userQuoteInteractions,
      eq(userQuoteInteractions.quoteId, quotes.id)
    )
    .where(
      and(
        eq(userQuoteInteractions.interactionType, 'like'),
        isNull(quotes.deletedAt)
      )
    )
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

  if (likedCategories.length === 0) {
    // いいねがない場合は人気の名言を返す
    return getPopularQuotes(limit)
  }

  const categoryIds = likedCategories.map((c) => c.categoryId)

  // 2. 同じカテゴリのまだ見ていない名言をランダムに取得
  return db
    .select()
    .from(quotes)
    .innerJoin(subcategories, eq(subcategories.id, quotes.subcategoryId))
    .where(
      and(
        inArray(subcategories.categoryId, categoryIds),
        isNull(quotes.deletedAt),
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

/**
 * ユーザーの統計情報を取得
 */
export async function getUserStats(userId: number) {
  const [likes, views, favorites] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(userQuoteInteractions)
      .where(
        and(
          eq(userQuoteInteractions.userId, userId),
          eq(userQuoteInteractions.interactionType, 'like')
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userQuoteInteractions)
      .where(
        and(
          eq(userQuoteInteractions.userId, userId),
          eq(userQuoteInteractions.interactionType, 'view')
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(userQuoteInteractions)
      .where(
        and(
          eq(userQuoteInteractions.userId, userId),
          eq(userQuoteInteractions.interactionType, 'favorite')
        )
      ),
  ])

  return {
    totalLikes: likes[0].count,
    totalViews: views[0].count,
    totalFavorites: favorites[0].count,
  }
}
```

## Server Componentsでのデータフェッチング

### パターン1: ページコンポーネントで直接フェッチ

```tsx
// src/app/(public)/page.tsx
import { getDailyQuotes } from '@/lib/db/queries/daily-quotes'
import { QuoteGrid } from '@/components/features/quote/quote-grid'
import { SearchBar } from '@/components/features/search/search-bar'

/**
 * TOPページ - Server Component
 */
export default async function HomePage() {
  // Server Componentで直接データ取得
  const quotes = await getDailyQuotes()

  return (
    <main className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">今日の名言</h1>

      <div className="mb-8">
        <SearchBar />
      </div>

      <QuoteGrid quotes={quotes} />
    </main>
  )
}

// キャッシング設定
export const revalidate = 0 // 常に最新データ（日替わりのため）
export const dynamic = 'force-dynamic' // 動的レンダリング

// メタデータ
export const metadata = {
  title: '今日の名言 | Inspiration Hub',
  description: '偉人やキャラクターの名言を毎日お届けします',
}
```

### パターン2: 並列データフェッチング

```tsx
// src/app/(public)/category/[id]/page.tsx
import { notFound } from 'next/navigation'
import {
  getCategoryById,
  getCategoryWithSubcategories,
  getAuthorsByCategory,
} from '@/lib/db/queries/categories'
import { getQuotesByCategory } from '@/lib/db/queries/quotes'

interface PageProps {
  params: { id: string }
}

export default async function CategoryPage({ params }: PageProps) {
  const categoryId = parseInt(params.id)

  // 並列でデータ取得（依存関係なし）
  const [category, subcategories, authors, recentQuotes] = await Promise.all([
    getCategoryById(categoryId),
    getCategoryWithSubcategories(categoryId),
    getAuthorsByCategory(categoryId),
    getQuotesByCategory(categoryId).then((quotes) => quotes.slice(0, 6)),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">{category.name}</h1>

      {/* 人物一覧 */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">人物一覧</h2>
        <AuthorList authors={authors} />
      </section>

      {/* 中項目一覧 */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">中項目で絞り込む</h2>
        <SubcategoryList subcategories={subcategories} />
      </section>

      {/* 最近の名言 */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">最近の名言</h2>
        <QuoteGrid quotes={recentQuotes} />
      </section>
    </div>
  )
}

export const revalidate = 3600 // 1時間キャッシュ
```

### パターン3: 順次データフェッチング（依存関係あり）

```tsx
// src/app/(public)/subcategory/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getSubcategoryById } from '@/lib/db/queries/subcategories'
import { getQuotesBySubcategory } from '@/lib/db/queries/quotes'

interface PageProps {
  params: { id: string }
}

export default async function SubcategoryPage({ params }: PageProps) {
  const subcategoryId = parseInt(params.id)

  // 1. まず中項目を取得
  const subcategory = await getSubcategoryById(subcategoryId)

  if (!subcategory) {
    notFound()
  }

  // 2. 中項目の情報に基づいて名言を取得（依存関係あり）
  const quotes = await getQuotesBySubcategory(subcategory.id)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link href={`/category/${subcategory.categoryId}`}>
              {subcategory.category.name}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{subcategory.name}</BreadcrumbItem>
        </Breadcrumb>

        <h1 className="mt-4 text-4xl font-bold">{subcategory.name}</h1>
        <p className="mt-2 text-muted-foreground">
          {quotes.length}件の名言
        </p>
      </div>

      <QuoteGrid quotes={quotes} />
    </div>
  )
}

export const revalidate = 3600
```

### パターン4: Suspenseによる段階的レンダリング

```tsx
// src/app/(public)/category/[id]/page.tsx
import { Suspense } from 'react'
import { getCategoryById } from '@/lib/db/queries/categories'
import { AuthorListSkeleton } from '@/components/features/author/author-list-skeleton'
import { QuoteListSkeleton } from '@/components/features/quote/quote-list-skeleton'

export default async function CategoryPage({ params }: PageProps) {
  // 重要なデータは先に取得
  const category = await getCategoryById(parseInt(params.id))

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-bold">{category.name}</h1>

      {/* 人物一覧は非同期で読み込み */}
      <Suspense fallback={<AuthorListSkeleton />}>
        <AuthorListSection categoryId={category.id} />
      </Suspense>

      {/* 名言一覧も非同期で読み込み */}
      <Suspense fallback={<QuoteListSkeleton />}>
        <QuoteListSection categoryId={category.id} />
      </Suspense>
    </div>
  )
}

// 別のServer Componentとして定義
async function AuthorListSection({ categoryId }: { categoryId: number }) {
  const authors = await getAuthorsByCategory(categoryId)
  return <AuthorList authors={authors} />
}

async function QuoteListSection({ categoryId }: { categoryId: number }) {
  const quotes = await getQuotesByCategory(categoryId)
  return <QuoteGrid quotes={quotes.slice(0, 6)} />
}
```

## Client Componentsでのデータフェッチング

### パターン1: API Route経由

```tsx
// src/components/features/search/search-container.tsx
"use client"

import { useState, useCallback } from 'react'
import { SearchBar } from './search-bar'
import { QuoteGrid } from '@/components/features/quote/quote-grid'
import { Quote } from '@/types/quote'

export function SearchContainer() {
  const [results, setResults] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        throw new Error('Search failed')
      }
      const data = await res.json()
      setResults(data.data || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div>
      <SearchBar onSearch={handleSearch} />

      {isLoading && <div>検索中...</div>}

      {!isLoading && results.length > 0 && (
        <QuoteGrid quotes={results} />
      )}

      {!isLoading && results.length === 0 && (
        <div>検索結果がありません</div>
      )}
    </div>
  )
}
```

### パターン2: SWR/React Queryを使用（今後導入検討）

```tsx
// 今後の拡張のために記載
// src/lib/hooks/use-quotes.ts
import useSWR from 'swr'
import { Quote } from '@/types/quote'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useQuotes(categoryId?: number) {
  const url = categoryId ? `/api/quotes?categoryId=${categoryId}` : '/api/quotes'

  const { data, error, isLoading, mutate } = useSWR<{
    data: Quote[]
  }>(url, fetcher)

  return {
    quotes: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// 使用例
"use client"

import { useQuotes } from '@/lib/hooks/use-quotes'

export function QuoteListContainer({ categoryId }: { categoryId: number }) {
  const { quotes, isLoading, isError } = useQuotes(categoryId)

  if (isLoading) return <QuoteListSkeleton />
  if (isError) return <div>エラーが発生しました</div>

  return <QuoteGrid quotes={quotes} />
}
```

## API Routes実装

### 検索API
```typescript
// src/app/api/search/route.ts
import { NextRequest } from 'next/server'
import { searchQuotes } from '@/lib/db/queries/quotes'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return successResponse([])
    }

    if (query.length < 2) {
      return errorResponse(
        'VALIDATION_ERROR',
        '検索キーワードは2文字以上で入力してください'
      )
    }

    const results = await searchQuotes(query.trim())

    return successResponse(results)
  } catch (error) {
    console.error('Search API error:', error)
    return errorResponse('INTERNAL_ERROR', '検索に失敗しました')
  }
}

// キャッシング無効化（検索結果は常に最新）
export const revalidate = 0
```

### 日替わり名言API
```typescript
// src/app/api/daily-quotes/route.ts
import { NextRequest } from 'next/server'
import { getDailyQuotes } from '@/lib/db/queries/daily-quotes'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') // YYYY-MM-DD

    const quotes = await getDailyQuotes(date || undefined)

    return successResponse(quotes)
  } catch (error) {
    console.error('Daily quotes API error:', error)
    return errorResponse('INTERNAL_ERROR', '日替わり名言の取得に失敗しました')
  }
}

// 日替わりなので短時間キャッシュ（5分）
export const revalidate = 300
```

## キャッシング戦略

### ページレベルキャッシング

```tsx
// TOPページ - 日替わりなので常に最新
export const revalidate = 0
export const dynamic = 'force-dynamic'

// カテゴリページ - 1時間キャッシュ
export const revalidate = 3600

// 人物ページ - 24時間キャッシュ
export const revalidate = 86400

// 静的ページ - ビルド時に生成
export const dynamic = 'force-static'
```

### fetchレベルキャッシング

```tsx
// デフォルト（キャッシュあり）
const data = await fetch('https://api.example.com/data')

// キャッシュなし
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// 10秒ごとに再検証
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 10 }
})

// タグベースのキャッシング
const data = await fetch('https://api.example.com/data', {
  next: { tags: ['quotes'] }
})

// キャッシュの再検証（Server Actions）
import { revalidateTag } from 'next/cache'
revalidateTag('quotes')
```

### Drizzle ORMクエリのキャッシング

```tsx
// Next.jsのキャッシュ機能を活用
import { unstable_cache } from 'next/cache'

export const getCachedCategories = unstable_cache(
  async () => {
    return db.query.categories.findMany({
      where: isNull(categories.deletedAt),
    })
  },
  ['categories-list'],
  {
    revalidate: 3600,
    tags: ['categories'],
  }
)
```

## エラーハンドリング

### データ取得エラー

```tsx
// src/app/(public)/category/[id]/page.tsx
import { notFound } from 'next/navigation'

export default async function CategoryPage({ params }: PageProps) {
  try {
    const category = await getCategoryById(parseInt(params.id))

    if (!category) {
      notFound() // 404ページへ
    }

    return <div>{/* レンダリング */}</div>
  } catch (error) {
    console.error('Category page error:', error)
    throw error // error.tsxでハンドリング
  }
}
```

### API Routeエラー

```tsx
// src/app/api/quotes/route.ts
import { AppError } from '@/lib/api/error'

export async function GET() {
  try {
    const quotes = await getQuotes()
    return successResponse(quotes)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    console.error('Unexpected error:', error)
    return errorResponse('INTERNAL_ERROR', '予期しないエラーが発生しました', 500)
  }
}
```

## パフォーマンス最適化

### 1. N+1クエリの回避

```tsx
// ❌ 悪い例: N+1クエリ
const categories = await db.query.categories.findMany()
for (const category of categories) {
  const subcategories = await db.query.subcategories.findMany({
    where: eq(subcategories.categoryId, category.id)
  })
}

// ✅ 良い例: 一度のクエリで取得
const categories = await db.query.categories.findMany({
  with: {
    subcategories: true,
  },
})
```

### 2. 必要なフィールドのみ選択

```tsx
// 全フィールドではなく必要なものだけ
const quotes = await db
  .select({
    id: quotes.id,
    text: quotes.textJa,
    authorName: authors.name,
  })
  .from(quotes)
  .innerJoin(authors, eq(quotes.authorId, authors.id))
```

### 3. ページネーション

```tsx
// src/lib/db/queries/quotes.ts
export async function getQuotesPaginated(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit

  const quotes = await db.query.quotes.findMany({
    where: isNull(quotes.deletedAt),
    limit,
    offset,
    orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
  })

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(isNull(quotes.deletedAt))

  return {
    quotes,
    totalCount: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  }
}
```

## バッチ処理（日替わり名言生成）

### Cloudflare Cron Trigger

```typescript
// src/app/api/cron/daily-quotes/route.ts
import { NextRequest } from 'next/server'
import { generateDailyQuotes } from '@/lib/db/queries/daily-quotes'
import { successResponse, errorResponse } from '@/lib/api/response'

/**
 * 日替わり名言生成バッチ
 * Cloudflare Cron Triggerで毎日0時（UTC）に実行
 */
export async function GET(request: NextRequest) {
  try {
    // Cronシークレットで認証
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      return errorResponse('UNAUTHORIZED', '認証に失敗しました', 401)
    }

    const today = new Date().toISOString().split('T')[0]
    const count = await generateDailyQuotes(today)

    return successResponse({
      message: `${count}件の日替わり名言を生成しました`,
      date: today,
      count,
    })
  } catch (error) {
    console.error('Daily quotes generation error:', error)
    return errorResponse(
      'INTERNAL_ERROR',
      '日替わり名言の生成に失敗しました'
    )
  }
}
```

### wrangler.jsonc設定

```jsonc
{
  "triggers": {
    "crons": ["0 0 * * *"]  // 毎日0時（UTC）
  }
}
```

## まとめ

### データフェッチングチェックリスト

- [ ] Server Componentsで可能な限りデータ取得
- [ ] 並列フェッチングを活用
- [ ] 適切なキャッシング戦略を設定
- [ ] エラーハンドリングを実装
- [ ] N+1クエリを回避
- [ ] 必要なフィールドのみ選択
- [ ] ページネーションを実装（大量データの場合）
- [ ] Loading UIを提供
- [ ] 型安全性を確保
