import type {
  Quote as DbQuote,
  Author,
  Subcategory,
  Category,
} from "@/lib/db/schema"
import type { QuoteDTO } from "@/lib/validators/quote"

export type { QuoteDTO }

/**
 * 名言型（DBの行 + リレーション）
 * 管理系 API（/api/quotes など）のレスポンスで使用
 */
export type Quote = DbQuote & {
  author: Author
  subcategory: Subcategory & {
    category: Category
  }
}

/**
 * 日替わり名言の取得結果
 * - daily: Cron で生成された daily_quotes から取得
 * - fallback: 当日分が未生成のため、日付シードで決定的に選定
 */
export interface DailyQuotesResult {
  date: string
  source: "daily" | "fallback"
  quotes: QuoteDTO[]
}

/**
 * 名言フォーム入力型
 */
export interface QuoteFormInput {
  text: string
  textJa?: string
  authorId: number
  subcategoryId: number
  background?: string
}
