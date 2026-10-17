"use client"

import { useRef, useState } from "react"
import { Check, Share2 } from "lucide-react"
import type { QuoteDTO } from "@/types/quote"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  quote: Pick<QuoteDTO, "id" | "text" | "textJa" | "author">
  className?: string
}

const COPIED_FEEDBACK_MS = 1600

/**
 * シェアボタン
 *
 * 「コピーしました」の一時表示は通常の state + タイマーで管理する。
 * （async transition で待機させると、その間は他の transition——タブ切り替えや
 * ページ遷移——まで巻き込んで保留されてしまうため使わない）
 */
export function ShareButton({ quote, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  async function handleShare(): Promise<void> {
    const url = new URL(`/quote/${quote.id}`, window.location.origin).toString()
    const text = `「${quote.textJa ?? quote.text}」— ${quote.author.name}`

    try {
      // Web Share API が使える環境（主にモバイル）は OS のシェアシートへ
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Inspiration Hub", text, url })
        return
      }

      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
    } catch (error) {
      // ユーザーによるキャンセル（AbortError）は正常系
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Failed to share quote:", error)
      }
    }
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
