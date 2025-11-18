import type {
  Quote as DbQuote,
  Author,
  Subcategory,
  Category,
} from "@/lib/db/schema"

/**
 * 名言型（リレーション含む）
 */
export type Quote = DbQuote & {
  author: Author
  subcategory: Subcategory & {
    category: Category
  }
}

/**
 * 名言カードProps
 */
export interface QuoteCardProps {
  quote: Quote
  variant?: "default" | "compact"
  showCategory?: boolean
}

/**
 * 名言グリッドProps
 */
export interface QuoteGridProps {
  quotes: Quote[]
}

/**
 * 名言ダイアログProps
 */
export interface QuoteDialogProps {
  quotes: Quote[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
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
