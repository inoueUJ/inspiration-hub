"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { likeQuoteAction } from "@/server/actions/like-quote"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  quoteId: number
  likeCount: number
  liked: boolean
  className?: string
}

interface LikeState {
  likeCount: number
  liked: boolean
}

/**
 * 「共感」ボタン - useOptimistic × async transition
 *
 * 1. クリック直後に楽観的にハートを点灯 + カウントを +1
 * 2. Server Action 完了時に revalidatePath された RSC が届き、props が確定値に置き換わる
 * 3. 失敗した場合は transition 終了とともに楽観的な状態が自動で元に戻る
 */
export function LikeButton({ quoteId, likeCount, liked, className }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [optimistic, addOptimisticLike] = useOptimistic<LikeState, void>(
    { likeCount, liked },
    (state) => (state.liked ? state : { likeCount: state.likeCount + 1, liked: true })
  )

  function handleClick(): void {
    if (optimistic.liked) return

    setError(null)
    startTransition(async () => {
      addOptimisticLike()
      const result = await likeQuoteAction(quoteId)

      if (!result.ok) {
        // await 以降の更新は transition の外になるため、明示的に包み直す
        startTransition(() => setError(result.message))
      }
    })
  }

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={optimistic.liked}
        aria-busy={isPending}
        aria-label={
          optimistic.liked
            ? `共感済み（${optimistic.likeCount}件）`
            : `この言葉に共感する（現在${optimistic.likeCount}件）`
        }
        title={optimistic.liked ? "共感済み" : "この言葉に共感する"}
        className={cn(
          "group/like inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm tabular-nums text-muted-foreground transition-colors outline-none hover:bg-like/10 hover:text-like focus-visible:ring-[3px] focus-visible:ring-ring/50",
          optimistic.liked && "text-like"
        )}
      >
        <Heart
          aria-hidden
          className={cn(
            "size-4 transition-transform group-active/like:scale-90",
            optimistic.liked && "animate-pop fill-like"
          )}
        />
        <span>{optimistic.likeCount}</span>
      </button>
      {error && (
        <span
          role="alert"
          className="absolute top-full left-0 z-20 mt-1 rounded-md bg-destructive px-2 py-1 text-xs whitespace-nowrap text-destructive-foreground shadow"
        >
          {error}
        </span>
      )}
    </span>
  )
}
