"use client"

import { use, useDeferredValue, useOptimistic, useState, useTransition } from "react"
import { Loader2, Search, X } from "lucide-react"
import type { DailyQuotesResult, QuoteDTO } from "@/types/quote"
import { QuoteGrid } from "@/components/features/quote/quote-grid"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryFilter = number | "all"

interface DailyQuotesExplorerProps {
  todayPromise: Promise<DailyQuotesResult>
  likedIdsPromise: Promise<number[]>
}

interface CategoryOption {
  id: number
  name: string
  count: number
}

function collectCategories(quotes: readonly QuoteDTO[]): CategoryOption[] {
  const byId = new Map<number, CategoryOption>()
  for (const { category } of quotes) {
    const option = byId.get(category.id)
    if (option) option.count += 1
    else byId.set(category.id, { ...category, count: 1 })
  }
  return [...byId.values()].sort((a, b) => a.id - b.id)
}

function matchesKeyword(quote: QuoteDTO, keyword: string): boolean {
  return [quote.text, quote.textJa ?? "", quote.author.name, quote.subcategory.name].some(
    (value) => value.toLowerCase().includes(keyword)
  )
}

/**
 * 今日の30件を「カテゴリ」と「キーワード」で絞り込むエクスプローラー
 *
 * - use(): サーバーで開始したクエリの Promise をここで解決（並列フェッチ + ストリーミング）
 * - useTransition: カテゴリ切り替えを非緊急の更新にして、グリッドの再描画で入力をブロックしない
 * - useOptimistic: transition 中もタブだけは即座に選択状態を反映
 * - useDeferredValue: キーワード入力は即時、絞り込み結果の描画は後追いにする
 *   （React Compiler がグリッドをメモ化するため、古い値での再描画はスキップされる）
 */
export function DailyQuotesExplorer({ todayPromise, likedIdsPromise }: DailyQuotesExplorerProps) {
  const { quotes } = use(todayPromise)
  const likedIds = use(likedIdsPromise)

  const [category, setCategory] = useState<CategoryFilter>("all")
  const [optimisticCategory, setOptimisticCategory] = useOptimistic(category)
  const [isPending, startTransition] = useTransition()

  const [keyword, setKeyword] = useState("")
  const deferredKeyword = useDeferredValue(keyword)
  const isStale = isPending || keyword !== deferredKeyword

  const categories = collectCategories(quotes)
  const normalizedKeyword = deferredKeyword.trim().toLowerCase()
  const visibleQuotes = quotes.filter(
    (quote) =>
      (category === "all" || quote.category.id === category) &&
      (normalizedKeyword === "" || matchesKeyword(quote, normalizedKeyword))
  )

  function selectCategory(next: CategoryFilter): void {
    startTransition(() => {
      setOptimisticCategory(next)
      setCategory(next)
    })
  }

  function reset(): void {
    setKeyword("")
    selectCategory("all")
  }

  const tabs: { value: CategoryFilter; label: string; count: number }[] = [
    { value: "all", label: "すべて", count: quotes.length },
    ...categories.map((option) => ({ value: option.id, label: option.name, count: option.count })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="カテゴリで絞り込む"
          className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0"
        >
          {tabs.map((tab) => {
            const selected = optimisticCategory === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCategory(tab.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "bg-card hover:border-foreground/40"
                )}
              >
                {tab.label}
                <span className={cn("text-xs tabular-nums", selected ? "opacity-70" : "text-muted-foreground")}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">今日の名言をキーワードで絞り込む</span>
          {isStale ? (
            <Loader2 aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="キーワード・人物名で絞り込む"
            className="h-10 w-full rounded-full border bg-card pr-4 pl-9 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
        </label>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visibleQuotes.length === quotes.length
          ? `${quotes.length}件の名言`
          : `${quotes.length}件中 ${visibleQuotes.length}件を表示`}
      </p>

      <div
        aria-busy={isStale}
        className={cn("transition-opacity duration-200", isStale && "opacity-60")}
      >
        {visibleQuotes.length > 0 ? (
          <QuoteGrid quotes={visibleQuotes} likedIds={likedIds} highlight={deferredKeyword} />
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <p>条件に合う名言が見つかりませんでした。</p>
            <Button variant="outline" size="sm" onClick={reset}>
              <X aria-hidden />
              条件をクリア
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
