/**
 * 「共感」の確定値ストア（クライアント専用）
 *
 * Server Action が返した最新の共感数を名言IDごとに保持し、同じ名言を表示している
 * すべての LikeButton（カードとダイアログなど）へ即座に配る。
 *
 * props 側の件数は revalidate のタイミングや、ブックマーク一覧のようなクライアント側の
 * 取得キャッシュ次第で古いことがある。共感は取り消しのない単調増加の値なので、
 * 「props とストアの大きい方」を採用すれば常に最新の観測値になる。
 */

type Listener = () => void

const listeners = new Set<Listener>()
const confirmedCounts = new Map<number, number>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getConfirmedLikeCount(quoteId: number): number | null {
  return confirmedCounts.get(quoteId) ?? null
}

/**
 * 閲覧者が共感したことと、その時点の共感数を記録する
 */
export function recordConfirmedLike(quoteId: number, likeCount: number): void {
  const current = confirmedCounts.get(quoteId)
  if (current !== undefined && current >= likeCount) return

  confirmedCounts.set(quoteId, likeCount)
  for (const listener of listeners) listener()
}
