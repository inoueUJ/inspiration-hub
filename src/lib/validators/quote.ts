import { z } from "zod"

/**
 * 名言作成スキーマ
 */
export const CreateQuoteSchema = z.object({
  text: z.string().min(1, "名言は最低1文字必要です").max(1000, "名言は1000文字以内で入力してください"),
  textJa: z.string().max(1000, "日本語訳は1000文字以内で入力してください").optional(),
  authorId: z.number().int("著者IDは整数である必要があります").positive("著者IDは正の数である必要があります"),
  subcategoryId: z.number().int("中項目IDは整数である必要があります").positive("中項目IDは正の数である必要があります"),
  background: z.string().max(2000, "背景情報は2000文字以内で入力してください").optional(),
})

export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>

/**
 * 名言更新スキーマ
 */
export const UpdateQuoteSchema = z.object({
  text: z.string().min(1, "名言は最低1文字必要です").max(1000, "名言は1000文字以内で入力してください").optional(),
  textJa: z.string().max(1000, "日本語訳は1000文字以内で入力してください").optional(),
  authorId: z.number().int("著者IDは整数である必要があります").positive("著者IDは正の数である必要があります").optional(),
  subcategoryId: z.number().int("中項目IDは整数である必要があります").positive("中項目IDは正の数である必要があります").optional(),
  background: z.string().max(2000, "背景情報は2000文字以内で入力してください").optional(),
})

export type UpdateQuoteInput = z.infer<typeof UpdateQuoteSchema>
