import { z } from "zod"
import { QuoteDTOSchema, type QuoteDTO } from "@/lib/validators/quote"

const LookupResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(QuoteDTOSchema),
})

const MAX_CACHE_ENTRIES = 16
const cache = new Map<string, Promise<QuoteDTO[]>>()

async function request(key: string): Promise<QuoteDTO[]> {
  const response = await fetch(`/api/quotes/lookup?ids=${key}`, {
    headers: { accept: "application/json" },
  })
  if (!response.ok) {
    throw new Error(`ブックマークの取得に失敗しました（${response.status}）`)
  }
  // レスポンスも Zod で検証し、型と実データの乖離を境界で検出する
  return LookupResponseSchema.parse(await response.json()).data
}

/**
 * IDの集合に対する名言取得の Promise を返す（クライアント用）
 *
 * use() に渡す Promise はレンダーごとに作り直してはいけない（毎回サスペンドする）ため、
 * キーごとにモジュールスコープでキャッシュする。失敗した Promise はキャッシュから外し、
 * エラーバウンダリからの再試行で再取得できるようにする。
 */
export function fetchQuotesByIds(ids: readonly number[]): Promise<QuoteDTO[]> {
  const key = [...ids].sort((a, b) => a - b).join(",")
  if (key === "") return Promise.resolve([])

  let promise = cache.get(key)
  if (!promise) {
    promise = request(key).catch((error: unknown) => {
      cache.delete(key)
      throw error
    })
    cache.set(key, promise)

    // 古いエントリから捨てる（Map は挿入順を保持する）
    if (cache.size > MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value
      if (oldestKey !== undefined) cache.delete(oldestKey)
    }
  }
  return promise
}
