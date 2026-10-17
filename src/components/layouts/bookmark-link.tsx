"use client"

import Link from "next/link"
import { Bookmark } from "lucide-react"
import { useBookmarkCount } from "@/lib/hooks/use-bookmarks"
import { buttonVariants } from "@/components/ui/button"

/**
 * ヘッダーのブックマークリンク（件数バッジ付き）
 * サーバーでは件数が分からないため、バッジはハイドレーション後に表示する
 */
export function BookmarkLink() {
  const count = useBookmarkCount()

  return (
    <Link
      href="/bookmarks"
      className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
      aria-label={count ? `ブックマーク（${count}件）` : "ブックマーク"}
      title="ブックマーク"
    >
      <Bookmark aria-hidden className="size-[1.15rem]" />
      {count ? (
        <span className="absolute top-0.5 right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  )
}
