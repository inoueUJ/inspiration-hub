"use client"

import Form from "next/form"
import { useRouter } from "next/navigation"
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react"
import { Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/validators/search"

interface SearchBoxProps {
  /** URL（searchParams）上の確定した検索語 */
  query: string
}

function toSearchHref(query: string): string {
  return query ? `/search?q=${encodeURIComponent(query)}` : "/search"
}

/**
 * 検索ボックス - URL を唯一の状態として扱うインクリメンタルサーチ
 *
 * - 入力のたびに router.replace を startTransition で実行
 *   → 結果の再取得中も入力欄は固まらず、古い結果を表示したまま isPending で薄く表示
 * - data-pending 属性を出すだけで、結果側は CSS（group-has-[[data-pending]]）で反応する
 *   → コンポーネント間で pending 状態を受け渡す Context が不要
 * - 日本語入力（IME）の変換中は検索しない（compositionend で確定）
 * - <Form action="/search"> により JS 読み込み前でも通常の GET フォームとして動作
 */
export function SearchBox({ query }: SearchBoxProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(query)
  const [lastQuery, setLastQuery] = useState(query)

  // 戻る/進む やヘッダーからの検索で URL が変わったら入力欄に反映する
  // （自分の遷移が進行中の間は、入力途中の文字を上書きしない）
  if (query !== lastQuery) {
    setLastQuery(query)
    if (!isPending && query !== value.trim()) {
      setValue(query)
    }
  }

  function search(next: string): void {
    const normalized = next.trim()
    // 空白の追加など、確定済みの検索語と変わらない入力では遷移しない
    if (!isPending && normalized === query) return

    startTransition(() => {
      router.replace(toSearchHref(normalized), { scroll: false })
    })
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value)
    const composing = event.nativeEvent instanceof InputEvent && event.nativeEvent.isComposing
    if (!composing) search(event.target.value)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    search(value)
  }

  function clear(): void {
    setValue("")
    search("")
  }

  return (
    <Form
      action="/search"
      replace
      role="search"
      onSubmit={handleSubmit}
      data-pending={isPending ? "" : undefined}
      className="relative"
    >
      <label htmlFor="search-query" className="sr-only">
        名言・人物名・カテゴリで検索
      </label>
      {isPending ? (
        <Loader2 aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 animate-spin text-primary" />
      ) : (
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        id="search-query"
        name="q"
        type="search"
        value={value}
        onChange={handleChange}
        onCompositionEnd={(event) => search(event.currentTarget.value)}
        placeholder="例：アインシュタイン、勇気、主人公"
        maxLength={MAX_SEARCH_QUERY_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
        autoFocus
        className="h-14 w-full rounded-2xl border bg-card pr-12 pl-12 text-base shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="button"
        onClick={clear}
        aria-label="検索語をクリア"
        className={cn(
          "absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground",
          value === "" && "pointer-events-none opacity-0"
        )}
      >
        <X aria-hidden className="size-4" />
      </button>
    </Form>
  )
}
