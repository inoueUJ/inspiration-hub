import { z } from "zod"

/**
 * 中項目作成スキーマ
 */
export const CreateSubcategorySchema = z.object({
  categoryId: z.number().int("カテゴリIDは整数である必要があります").positive("カテゴリIDは正の数である必要があります"),
  name: z.string().min(1, "中項目名は最低1文字必要です").max(100, "中項目名は100文字以内で入力してください"),
})

export type CreateSubcategoryInput = z.infer<typeof CreateSubcategorySchema>

/**
 * 中項目更新スキーマ
 */
export const UpdateSubcategorySchema = z.object({
  categoryId: z.number().int("カテゴリIDは整数である必要があります").positive("カテゴリIDは正の数である必要があります").optional(),
  name: z.string().min(1, "中項目名は最低1文字必要です").max(100, "中項目名は100文字以内で入力してください").optional(),
})

export type UpdateSubcategoryInput = z.infer<typeof UpdateSubcategorySchema>
