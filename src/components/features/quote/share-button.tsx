"use client"

import { useOptimistic, useTransition } from "react"
import { Check, Share2 } from "lucide-react"
import type { QuoteDTO } from "@/types/quote"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  quote: Pick<QuoteDTO, "id" | "text" | "textJa" | "author">
  className?: string
}

const COPIED_FEEDBACK_MS = 1600

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * シェアボタン
 *
 * 「コピーしました」の一時表示を useOptimistic で表現している。
 * 楽観的な値は transition の間だけ有効で、終了すると自動で false に戻るため、
 * setTimeout + useEffect でのリセット処理やアンマウント時の後始末が要らない。
 */
export function ShareButton({ quote, className }: ShareButtonProps) {
  const [copied, setCopied] = useOptimistic(false)
  const [, startTransition] = useTransition()

  function handleShare(): void {
    const url = new URL(`/quote/${quote.id}`, window.location.origin).toString()
    const text = `「${quote.textJa ?? quote.text}」— ${quote.author.name}`

    // Web Share API が使える環境（主にモバイル）は OS のシェアシートへ
    if (typeof navigator.share === "function") {
      navigator.share({ title: "Inspiration Hub", text, url }).catch((error: unknown) => {
        // ユーザーによるキャンセル（AbortError）は正常系
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to share quote:", error)
        }
      })
      return
    }

    startTransition(async () => {
      // 楽観的な更新は await より前（transition のスコープ内）で行う
      setCopied(true)
      try {
        await Promise.all([
          navigator.clipboard.writeText(`${text}\n${url}`),
          wait(COPIED_FEEDBACK_MS),
        ])
      } catch (error) {
        console.error("Failed to copy quote:", error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "リンクをコピーしました" : "この名言をシェア"}
      title="シェア"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        copied && "text-success",
        className
      )}
    >
      {copied ? <Check aria-hidden className="size-4" /> : <Share2 aria-hidden className="size-4" />}
      <span aria-live="polite" className={cn(!copied && "sr-only")}>
        {copied ? "コピーしました" : ""}
      </span>
    </button>
  )
}
