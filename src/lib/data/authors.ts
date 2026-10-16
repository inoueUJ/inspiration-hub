import { cache } from "react"
import { and, asc, countDistinct, desc, eq, isNull } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { authors, quotes, subcategories, categories } from "@/lib/db/schema"
import { CreateAuthorSchema, UpdateAuthorSchema } from "@/lib/validators/author"

/**
 * 人物の概要（名言数付き）
 */
export interface AuthorSummary {
  id: number
  name: string
  quoteCount: number
}

/**
 * 人物プロフィール（名言数・登場カテゴリ付き）
 */
export interface AuthorProfile extends AuthorSummary {
  categories: { id: number; name: string }[]
}

/**
 * 公開中の名言に紐づく行のみを対象にする条件
 */
const hasPublishedQuote = and(
  isNull(authors.deletedAt),
  isNull(quotes.deletedAt),
  isNull(subcategories.deletedAt),
  isNull(categories.deletedAt)
)

/**
 * 全人物を取得（削除済み除外）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAllAuthors = cache(async () => {
  const db = await getDb()
  return db
    .select()
    .from(authors)
    .where(isNull(authors.deletedAt))
    .orderBy(asc(authors.name))
})

/**
 * 人物IDで取得
 * React.cache() により generateMetadata と page で同じクエリを共有する
 */
export const getAuthorById = cache(async (id: number) => {
  const db = await getDb()
  const [author] = await db
    .select()
    .from(authors)
    .where(and(eq(authors.id, id), isNull(authors.deletedAt)))
    .limit(1)

  return author ?? null
})

/**
 * 人物プロフィールを取得
 * 名言数と登場カテゴリを1回の JOIN から組み立てる
 */
export const getAuthorProfile = cache(
  async (id: number): Promise<AuthorProfile | null> => {
    const author = await getAuthorById(id)
    if (!author) return null

    const db = await getDb()
    const rows = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        quoteCount: countDistinct(quotes.id),
      })
      .from(quotes)
      .innerJoin(authors, eq(quotes.authorId, authors.id))
      .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(and(eq(quotes.authorId, id), hasPublishedQuote))
      .groupBy(categories.id, categories.name)
      .orderBy(asc(categories.id))

    return {
      id: author.id,
      name: author.name,
      quoteCount: rows.reduce((sum, row) => sum + row.quoteCount, 0),
      categories: rows.map((row) => ({ id: row.categoryId, name: row.categoryName })),
    }
  }
)

/**
 * カテゴリIDで人物一覧を取得（名言数の多い順）
 * React.cache() により同一リクエスト内で重複排除
 */
export const getAuthorsByCategory = cache(
  async (categoryId: number): Promise<AuthorSummary[]> => {
    const db = await getDb()
    const quoteCount = countDistinct(quotes.id)

    return db
      .select({ id: authors.id, name: authors.name, quoteCount })
      .from(authors)
      .innerJoin(quotes, eq(quotes.authorId, authors.id))
      .innerJoin(subcategories, eq(quotes.subcategoryId, subcategories.id))
      .innerJoin(categories, eq(subcategories.categoryId, categories.id))
      .where(and(eq(categories.id, categoryId), hasPublishedQuote))
      .groupBy(authors.id, authors.name)
      .orderBy(desc(quoteCount), asc(authors.name))
  }
)

/**
 * ミューテーション系（cache不要）
 * Rule 7: Zod による Runtime Validation
 */

/**
 * 人物を作成
 * Zod validationで入力を検証
 */
export async function createAuthor(data: unknown) {
  const validated = CreateAuthorSchema.parse(data)

  const db = await getDb()
  const [author] = await db
    .insert(authors)
    .values(validated)
    .returning()

  return author
}

/**
 * 人物を更新
 * Zod validationで入力を検証
 */
export async function updateAuthor(id: number, data: unknown) {
  const validated = UpdateAuthorSchema.parse(data)

  const db = await getDb()
  const [author] = await db
    .update(authors)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(and(eq(authors.id, id), isNull(authors.deletedAt)))
    .returning()

  return author ?? null
}

/**
 * 人物を削除（論理削除）
 */
export async function deleteAuthor(id: number) {
  const db = await getDb()
  const [author] = await db
    .update(authors)
    .set({ deletedAt: new Date() })
    .where(and(eq(authors.id, id), isNull(authors.deletedAt)))
    .returning()

  return author ?? null
}
