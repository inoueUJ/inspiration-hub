import { useSyncExternalStore } from "react"
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/bookmarks/store"

/**
 * ブックマークID一覧（新しい順）
 * サーバー / ハイドレーション中は null（未確定）
 */
export function useBookmarkIds(): readonly number[] | null {
  return useSyncExternalStore<readonly number[] | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
}

/**
 * 特定の名言がブックマーク済みか
 *
 * セレクタで boolean（プリミティブ）を返すことで、他の名言のブックマーク変更では
 * このコンポーネントが再レンダリングされないようにしている。
 */
export function useIsBookmarked(quoteId: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot().includes(quoteId),
    () => false
  )
}

/**
 * ブックマーク件数（未確定時は null）
 */
export function useBookmarkCount(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    () => getSnapshot().length,
    () => null
  )
}
