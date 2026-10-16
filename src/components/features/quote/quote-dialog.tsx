"use client"

import Link from "next/link"
import type { KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import type { QuoteDTO } from "@/types/quote"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LikeButton } from "./like-button"
import { BookmarkButton } from "./bookmark-button"
import { ShareButton } from "./share-button"

interface QuoteDialogProps {
  quotes: readonly QuoteDTO[]
  selectedId: number | null
  open: boolean
  likedIds: ReadonlySet<number>
  onOpenChange: (open: boolean) => void
  onSelect: (quoteId: number) => void
}

/**
 * 名言の詳細ダイアログ（完全な Controlled Component）
 *
 * 旧実装の「props の initialIndex を useEffect で state に同期」をやめ、
 * 選択状態はグリッド側の1か所だけに持たせている（Single Source of Truth）。
 * キーボード操作も window へのリスナー登録ではなく onKeyDown で完結させる。
 */
export function QuoteDialog({
  quotes,
  selectedId,
  open,
  likedIds,
  onOpenChange,
  onSelect,
}: QuoteDialogProps) {
  const index = quotes.findIndex((quote) => quote.id === selectedId)
  const quote = index === -1 ? null : quotes[index]
  const canNavigate = quotes.length > 1

  function selectRelative(offset: number): void {
    if (!canNavigate || index === -1) return
    const nextIndex = (index + offset + quotes.length) % quotes.length
    onSelect(quotes[nextIndex].id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      selectRelative(-1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      selectRelative(1)
    }
  }

  return (
    <Dialog open={open && quote !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-6 p-6 sm:p-10" onKeyDown={handleKeyDown}>
        {quote && (
          <>
            <div className="flex flex-wrap items-center gap-2 pr-8 text-xs text-muted-foreground">
              <Link href={`/category/${quote.category.id}`} className="hover:text-primary">
                {quote.category.name}
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/subcategory/${quote.subcategory.id}`} className="hover:text-primary">
                {quote.subcategory.name}
              </Link>
            </div>

            <figure key={quote.id} className="animate-fade-up space-y-4">
              <DialogTitle asChild>
                <blockquote className="font-serif text-2xl leading-relaxed font-normal tracking-wide text-balance sm:text-3xl">
                  {quote.textJa ?? quote.text}
                </blockquote>
              </DialogTitle>
              {quote.textJa && (
                <p lang="en" className="text-sm text-muted-foreground italic">
                  {quote.text}
                </p>
              )}
              <figcaption>
                <Link
                  href={`/author/${quote.author.id}`}
                  className="font-medium transition-colors hover:text-primary"
                >
                  — {quote.author.name}
                </Link>
              </figcaption>
            </figure>

            {quote.background ? (
              <DialogDescription asChild>
                <section className="rounded-xl bg-muted/70 p-4 text-sm leading-relaxed">
                  <h3 className="mb-1 font-semibold text-foreground">背景</h3>
                  <p>{quote.background}</p>
                </section>
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">
                {quote.author.name}の名言
              </DialogDescription>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <div className="-ml-2 flex items-center">
                {/* key で名言ごとに楽観的状態をリセット */}
                <LikeButton
                  key={quote.id}
                  quoteId={quote.id}
                  likeCount={quote.likeCount}
                  liked={likedIds.has(quote.id)}
                />
                <BookmarkButton quoteId={quote.id} withLabel />
                <ShareButton quote={quote} />
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/quote/${quote.id}`}>
                  詳細ページ
                  <ExternalLink aria-hidden />
                </Link>
              </Button>
            </div>

            {canNavigate && (
              <nav aria-label="名言の切り替え" className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => selectRelative(-1)}>
                  <ChevronLeft aria-hidden />
                  前へ
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                  {index + 1} / {quotes.length}
                </span>
                <Button variant="outline" size="sm" onClick={() => selectRelative(1)}>
                  次へ
                  <ChevronRight aria-hidden />
                </Button>
              </nav>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
