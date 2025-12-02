import { z } from "zod"

/**
 * 著者作成スキーマ
 */
export const CreateAuthorSchema = z.object({
  name: z.string().min(1, "著者名は最低1文字必要です").max(100, "著者名は100文字以内で入力してください"),
})

export type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>

/**
 * 著者更新スキーマ
 */
export const UpdateAuthorSchema = z.object({
  name: z.string().min(1, "著者名は最低1文字必要です").max(100, "著者名は100文字以内で入力してください").optional(),
})

export type UpdateAuthorInput = z.infer<typeof UpdateAuthorSchema>
