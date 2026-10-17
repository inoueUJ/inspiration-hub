import { z } from "zod"

/**
 * 検索語の最大長（UTF-16 コード単位。<input maxLength> と同じ数え方）
 */
export const MAX_SEARCH_QUERY_LENGTH = 100

/**
 * URL の ?q= を検索語に正規化する
 * 上限を超える値は捨てずに切り詰める（捨てると入力欄の内容まで消えてしまう）
 */
export const SearchQuerySchema = z
  .string()
  .transform((value) => value.trim().slice(0, MAX_SEARCH_QUERY_LENGTH).trim())
  .catch("")
