import { z } from "zod"

/**
 * カテゴリ作成スキーマ
 */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名は最低1文字必要です").max(100, "カテゴリ名は100文字以内で入力してください"),
})

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>

/**
 * カテゴリ更新スキーマ
 */
export const UpdateCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名は最低1文字必要です").max(100, "カテゴリ名は100文字以内で入力してください").optional(),
})

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
