import { useSyncExternalStore } from "react"
import { getConfirmedLikeCount, subscribe } from "@/lib/likes/store"

/**
 * この名言について Server Action で確定した共感数（未確定なら null）
 * セレクタで数値を返すため、他の名言の更新ではこのコンポーネントは再レンダリングされない
 */
export function useConfirmedLikeCount(quoteId: number): number | null {
  return useSyncExternalStore(
    subscribe,
    () => getConfirmedLikeCount(quoteId),
    () => null
  )
}
