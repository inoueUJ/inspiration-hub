"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Quote } from "@/types/quote"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface QuoteDialogProps {
  quotes: Quote[]
  initialIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * 名言ダイアログ - Client Component
 * 前後ナビゲーション機能付き
 */
export function QuoteDialog({
  quotes,
  initialIndex,
  open,
  onOpenChange,
}: QuoteDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const currentQuote = quotes[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : quotes.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < quotes.length - 1 ? prev + 1 : 0))
  }

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === "ArrowLeft") {
        handlePrev()
      } else if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, currentIndex, quotes.length])

  if (!currentQuote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap gap-2 text-base font-normal text-muted-foreground">
            <Link
              href={`/subcategory/${currentQuote.subcategory.id}`}
              className="hover:text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {currentQuote.subcategory.name}
            </Link>
            <span>•</span>
            <Link
              href={`/author/${currentQuote.author.id}`}
              className="hover:text-primary hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {currentQuote.author.name}
            </Link>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 名言本文 */}
          <div className="space-y-2">
            <p className="text-xl leading-relaxed">
              {currentQuote.textJa || currentQuote.text}
            </p>
            {currentQuote.textJa && currentQuote.text && (
              <p className="text-sm italic text-muted-foreground">
                {currentQuote.text}
              </p>
            )}
          </div>

          {/* 背景情報 */}
          {currentQuote.background && (
            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-semibold">背景</h4>
              <p className="text-sm text-muted-foreground">
                {currentQuote.background}
              </p>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={quotes.length <= 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              前へ
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {quotes.length}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={quotes.length <= 1}
            >
              次へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
