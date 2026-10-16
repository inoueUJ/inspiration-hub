"use client"

import { useState } from "react"
import type { QuoteDTO } from "@/types/quote"
import { cn } from "@/lib/utils"
import { QuoteCard } from "./quote-card"
import { QuoteDialog } from "./quote-dialog"

interface QuoteGridProps {
  quotes: readonly QuoteDTO[]
  likedIds: readonly number[]
  highlight?: string
  className?: string
}

/**
 * 名言グリッド - Client Component
 *
 * 「どの名言を開いているか」は index ではなく id で持つ。
 * フィルタや revalidate で配列が入れ替わっても、開いている名言がズレない。
 * open と selectedId を分けているのは、閉じるアニメーション中も内容を描画し続けるため。
 */
export function QuoteGrid({ quotes, likedIds, highlight, className }: QuoteGridProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const likedSet = new Set(likedIds)

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
        {quotes.map((quote) => (
          <li key={quote.id}>
            <QuoteCard
              quote={quote}
              liked={likedSet.has(quote.id)}
              highlight={highlight}
              onOpen={() => {
                setSelectedId(quote.id)
                setOpen(true)
              }}
            />
          </li>
        ))}
      </ul>

      <QuoteDialog
        quotes={quotes}
        selectedId={selectedId}
        open={open}
        likedIds={likedSet}
        onOpenChange={setOpen}
        onSelect={setSelectedId}
      />
    </>
  )
}
