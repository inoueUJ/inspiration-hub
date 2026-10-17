import { z } from "zod"

/**
 * フォーム（FormData）の空文字を undefined に正規化する任意テキスト
 */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label}は${max}文字以内で入力してください`)
    .transform((value) => (value === "" ? undefined : value))
    .optional()

const requiredText = (max: number, label: string) =>
  z
    .string({ error: `${label}を入力してください` })
    .trim()
    .min(1, `${label}を入力してください`)
    .max(max, `${label}は${max}文字以内で入力してください`)

/**
 * 名言投稿スキーマ（ユーザー投稿フォーム）
 */
export const QuoteSubmissionSchema = z.object({
  text: requiredText(1000, "名言"),
  textJa: optionalText(1000, "日本語訳"),
  authorName: requiredText(100, "人物名"),
  categoryName: optionalText(100, "カテゴリ"),
  subcategoryName: optionalText(100, "中項目"),
  background: optionalText(2000, "背景・エピソード"),
  submitterName: optionalText(50, "ニックネーム"),
  submitterEmail: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .pipe(z.email("メールアドレスの形式が正しくありません").optional())
    .optional(),
})

export type QuoteSubmissionInput = z.infer<typeof QuoteSubmissionSchema>

export type QuoteSubmissionField = keyof z.input<typeof QuoteSubmissionSchema>

export const QUOTE_SUBMISSION_FIELDS = [
  "text",
  "textJa",
  "authorName",
  "categoryName",
  "subcategoryName",
  "background",
  "submitterName",
  "submitterEmail",
] as const satisfies readonly QuoteSubmissionField[]
