import { notFound } from "next/navigation"
import { z } from "zod"

const RouteIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER))

/**
 * 動的ルートの [id] を数値に変換（不正な値は null）
 */
export function parseRouteId(value: string): number | null {
  const parsed = RouteIdSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

/**
 * 動的ルートの [id] を数値に変換し、不正な値なら 404 にする
 */
export function parseRouteIdOrNotFound(value: string): number {
  return parseRouteId(value) ?? notFound()
}

/**
 * searchParams の値を単一の文字列に正規化（?q=a&q=b のような配列は先頭を採用）
 */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}
