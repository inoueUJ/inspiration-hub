import { db } from "@/lib/db/client"
import { authors, quotes } from "@/lib/db/schema"
import { eq, isNull, sql } from "drizzle-orm"

/**
 * 全人物を取得（削除済み除外）
 */
export async function getAllAuthors() {
  return db
    .select()
    .from(authors)
    .where(isNull(authors.deletedAt))
    .orderBy(authors.name)
}

/**
 * 人物IDで取得
 */
export async function getAuthorById(id: number) {
  const [author] = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .where(isNull(authors.deletedAt))
    .limit(1)

  return author || null
}

/**
 * 人物を作成
 */
export async function createAuthor(name: string) {
  const [author] = await db
    .insert(authors)
    .values({ name })
    .returning()

  return author
}

/**
 * 人物を更新
 */
export async function updateAuthor(id: number, name: string) {
  const [author] = await db
    .update(authors)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(authors.id, id))
    .where(isNull(authors.deletedAt))
    .returning()

  return author || null
}

/**
 * 人物を削除（論理削除）
 */
export async function deleteAuthor(id: number) {
  const [author] = await db
    .update(authors)
    .set({ deletedAt: new Date() })
    .where(eq(authors.id, id))
    .returning()

  return author || null
}

/**
 * 人物の名言数を取得
 */
export async function getAuthorWithCount(id: number) {
  const author = await getAuthorById(id)
  if (!author) return null

  const [quoteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(eq(quotes.authorId, id))
    .where(isNull(quotes.deletedAt))

  return {
    ...author,
    _count: {
      quotes: quoteCount.count,
    },
  }
}

/**
 * カテゴリIDで人物一覧を取得（名言数含む）
 */
export async function getAuthorsByCategory(categoryId: number) {
  const result = await db
    .select({
      id: authors.id,
      name: authors.name,
      createdAt: authors.createdAt,
      updatedAt: authors.updatedAt,
      deletedAt: authors.deletedAt,
      quoteCount: sql<number>`count(distinct ${quotes.id})`.as("quote_count"),
    })
    .from(authors)
    .innerJoin(quotes, eq(quotes.authorId, authors.id))
    .innerJoin(
      sql`subcategories`,
      sql`${quotes.subcategoryId} = subcategories.id`
    )
    .where(sql`subcategories.category_id = ${categoryId}`)
    .where(isNull(authors.deletedAt))
    .where(isNull(quotes.deletedAt))
    .groupBy(authors.id, authors.name, authors.createdAt, authors.updatedAt, authors.deletedAt)
    .orderBy(authors.name)

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    _count: {
      quotes: row.quoteCount,
    },
  }))
}
