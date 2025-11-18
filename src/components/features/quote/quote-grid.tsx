"use client"

import { useState, useCallback } from "react"
import type { Quote } from "@/types/quote"
import { QuoteCard } from "./quote-card"
import { QuoteDialog } from "./quote-dialog"

interface QuoteGridProps {
  quotes: Quote[]
}

/**
 * 名言グリッド - Client Component
 * クリックイベントとダイアログ表示を管理
 */
export function QuoteGrid({ quotes }: QuoteGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleCardClick = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleDialogClose = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  if (quotes.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">名言がありません</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            onClick={() => handleCardClick(index)}
            className="cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <QuoteCard quote={quote} />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <QuoteDialog
          quotes={quotes}
          initialIndex={selectedIndex}
          open={selectedIndex !== null}
          onOpenChange={(open) => !open && handleDialogClose()}
        />
      )}
    </>
  )
}
