import { z } from "zod"

/**
 * ブックマークの外部ストア（localStorage）
 *
 * - React の外にある可変データなので useSyncExternalStore で購読する
 * - storage イベントで別タブの変更にも追従する
 * - getSnapshot は「値が変わらない限り同じ参照」を返す必要があるため、
 *   読み込み結果をモジュールスコープにキャッシュする
 */

const STORAGE_KEY = "inspiration-hub:bookmarks"
export const MAX_BOOKMARKS = 100

const BookmarksSchema = z.array(z.number().int().positive()).max(MAX_BOOKMARKS)

type Listener = () => void

const listeners = new Set<Listener>()
let snapshot: readonly number[] | undefined

function readFromStorage(): readonly number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = BookmarksSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    // JSON 破損 / localStorage 無効（プライベートモード等）
    return []
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return
  snapshot = readFromStorage()
  emit()
}

function commit(next: readonly number[]): void {
  snapshot = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 保存できない環境ではメモリ上のみで保持する
  }
  emit()
}

export function subscribe(listener: Listener): () => void {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage)
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage)
    }
  }
}

export function getSnapshot(): readonly number[] {
  snapshot ??= readFromStorage()
  return snapshot
}

/**
 * サーバー（およびハイドレーション時）は「まだ分からない」を表す null
 * 空配列と区別することで、ハイドレーション直後に空状態がチラつくのを防ぐ
 */
export function getServerSnapshot(): null {
  return null
}

export function toggleBookmark(quoteId: number): void {
  const current = getSnapshot()
  commit(
    current.includes(quoteId)
      ? current.filter((id) => id !== quoteId)
      : [quoteId, ...current].slice(0, MAX_BOOKMARKS)
  )
}

export function removeBookmark(quoteId: number): void {
  commit(getSnapshot().filter((id) => id !== quoteId))
}

export function clearBookmarks(): void {
  commit([])
}
