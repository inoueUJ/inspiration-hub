"use client"

import Link from "next/link"
import type { MouseEvent } from "react"
import type { QuoteDTO } from "@/types/quote"
import { cn } from "@/lib/utils"
import { Highlight } from "./highlight"
import { LikeButton } from "./like-button"
import { BookmarkButton } from "./bookmark-button"

interface QuoteCardProps {
  quote: QuoteDTO
  liked: boolean
  /** 指定するとカードクリックで詳細ダイアログを開く（未指定なら詳細ページへ遷移） */
  onOpen?: () => void
  highlight?: string
  className?: string
}

/**
 * 修飾キー付きクリック（新しいタブで開く等）はブラウザ標準の挙動に任せる
 */
function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

/**
 * 名言カード
 *
 * - カード全体をクリック領域にする「stretched link」パターン
 *   （ボタンの入れ子を避けつつ、いいね等の操作は z-index で前面に出す）
 * - 実体は /quote/[id] へのリンクなので、JS 読み込み前や Cmd+クリックでも機能する
 * - onClick をクロージャで持つため Client Component（Server からは onOpen なしで描画可能）
 */
export function QuoteCard({ quote, liked, onOpen, highlight, className }: QuoteCardProps) {
  const body = quote.textJa ?? quote.text

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-xs transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50 sm:p-6",
        className
      )}
    >
      <div className="relative z-10 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <Link
          href={`/category/${quote.category.id}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          {quote.category.name}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/subcategory/${quote.subcategory.id}`}
          className="rounded-sm transition-colors hover:text-primary"
        >
          <Highlight text={quote.subcategory.name} query={highlight} />
        </Link>
      </div>

      <blockquote className="flex-1">
        <p className="font-serif text-[1.05rem] leading-relaxed tracking-wide text-pretty sm:text-lg">
          <Link
            href={`/quote/${quote.id}`}
            scroll={false}
            onClick={(event) => {
              if (!onOpen || isModifiedClick(event)) return
              event.preventDefault()
              onOpen()
            }}
            className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
          >
            <Highlight text={body} query={highlight} />
          </Link>
        </p>
        {quote.textJa && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground italic">
            <Highlight text={quote.text} query={highlight} />
          </p>
        )}
      </blockquote>

      <footer className="relative z-10 mt-4 flex items-center justify-between gap-2">
        <Link
          href={`/author/${quote.author.id}`}
          className="truncate text-sm font-medium transition-colors hover:text-primary"
        >
          — <Highlight text={quote.author.name} query={highlight} />
        </Link>
        <div className="-mr-2 flex shrink-0 items-center">
          <LikeButton quoteId={quote.id} likeCount={quote.likeCount} liked={liked} />
          <BookmarkButton quoteId={quote.id} />
        </div>
      </footer>
    </article>
  )
}
