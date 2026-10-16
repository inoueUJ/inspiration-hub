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

/**
 * 公開用の名言DTOスキーマ
 *
 * Server → Client の境界（RSC props / Route Handler の JSON）を流れる唯一の形。
 * DBの行（createdAt / deletedAt など）をそのままクライアントへ漏らさないための
 * 「Data Transfer Object」で、クライアント側で fetch したレスポンスの検証にも使う。
 */
const EntityRefSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
})

export const QuoteDTOSchema = z.object({
  id: z.number().int().positive(),
  text: z.string(),
  textJa: z.string().nullable(),
  background: z.string().nullable(),
  likeCount: z.number().int().nonnegative(),
  author: EntityRefSchema,
  subcategory: EntityRefSchema,
  category: EntityRefSchema,
})

export type QuoteDTO = z.infer<typeof QuoteDTOSchema>

/**
 * 名言IDリスト（`?ids=1,2,3`）スキーマ
 * ブックマーク一覧の一括取得で使用
 */
export const QuoteIdsParamSchema = z
  .string()
  .regex(/^\d+(,\d+)*$/, "idsはカンマ区切りの数値で指定してください")
  .transform((value) => [...new Set(value.split(",").map(Number))])
  .pipe(z.array(z.number().int().positive()).max(100, "一度に取得できるのは100件までです"))
