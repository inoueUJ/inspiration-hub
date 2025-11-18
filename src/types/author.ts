import type { Author as DbAuthor } from "@/lib/db/schema"

/**
 * 人物型
 */
export type Author = DbAuthor

/**
 * カウント付き人物型
 */
export type AuthorWithCount = Author & {
  _count: {
    quotes: number
  }
}

/**
 * 人物リストProps
 */
export interface AuthorListProps {
  authors: AuthorWithCount[]
}

/**
 * 人物カードProps
 */
export interface AuthorCardProps {
  author: AuthorWithCount
}
