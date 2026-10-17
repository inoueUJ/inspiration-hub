"use client"

import { Bookmark } from "lucide-react"
import { toggleBookmark } from "@/lib/bookmarks/store"
import { useIsBookmarked } from "@/lib/hooks/use-bookmarks"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  quoteId: number
  className?: string
  withLabel?: boolean
}

/**
 * ブックマークボタン - useSyncExternalStore で localStorage を購読
 * サーバーを介さないため楽観的更新すら不要で、別タブにも即時反映される
 */
export function BookmarkButton({ quoteId, className, withLabel = false }: BookmarkButtonProps) {
  const bookmarked = useIsBookmarked(quoteId)

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(quoteId)}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
      title={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50",
        bookmarked && "text-primary",
        className
      )}
    >
      <Bookmark
        aria-hidden
        className={cn("size-4", bookmarked && "animate-pop fill-primary")}
      />
      {withLabel && <span>{bookmarked ? "保存済み" : "保存"}</span>}
    </button>
  )
}
