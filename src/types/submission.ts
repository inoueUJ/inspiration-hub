import type { QuoteSubmissionField } from "@/lib/validators/submission"

export type SubmissionFieldErrors = Partial<Record<QuoteSubmissionField, string[]>>
export type SubmissionValues = Partial<Record<QuoteSubmissionField, string>>

/**
 * 名言投稿フォームの状態（useActionState で受け渡す）
 *
 * React 19 の <form action> は送信完了後にフォームを自動リセットするため、
 * エラー時は入力値（values）を返して defaultValue で復元する。
 */
export type SubmitQuoteState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error"
      message: string
      fieldErrors: SubmissionFieldErrors
      values: SubmissionValues
    }
