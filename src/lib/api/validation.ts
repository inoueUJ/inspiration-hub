import { z } from "zod";

/**
 * カテゴリ作成スキーマ
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名は必須です").max(100),
});

/**
 * カテゴリ更新スキーマ
 */
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

/**
 * 中項目作成スキーマ
 */
export const createSubcategorySchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1, "中項目名は必須です").max(100),
});

/**
 * 中項目更新スキーマ
 */
export const updateSubcategorySchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z.string().min(1).max(100).optional(),
});

/**
 * 人物作成スキーマ
 */
export const createAuthorSchema = z.object({
  name: z.string().min(1, "人物名は必須です").max(200),
});

/**
 * 人物更新スキーマ
 */
export const updateAuthorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
});

/**
 * 名言作成スキーマ
 */
export const createQuoteSchema = z.object({
  text: z.string().min(1, "名言テキストは必須です"),
  textJa: z.string().optional(),
  authorId: z.number().int().positive(),
  subcategoryId: z.number().int().positive(),
  background: z.string().optional(),
});

/**
 * 名言更新スキーマ
 */
export const updateQuoteSchema = z.object({
  text: z.string().min(1).optional(),
  textJa: z.string().optional(),
  authorId: z.number().int().positive().optional(),
  subcategoryId: z.number().int().positive().optional(),
  background: z.string().optional(),
});

/**
 * ログインスキーマ
 */
export const loginSchema = z.object({
  password: z.string().min(1, "パスワードは必須です"),
});

/**
 * 日付パラメータスキーマ
 */
export const dateParamSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付はYYYY-MM-DD形式で指定してください")
    .optional(),
});

/**
 * IDパラメータスキーマ
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});
