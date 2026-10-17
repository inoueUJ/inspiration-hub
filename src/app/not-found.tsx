import type { Metadata } from "next"
import { NotFoundView } from "@/components/features/error/not-found-view"

export const metadata: Metadata = {
  title: "ページが見つかりません",
}

/**
 * どのルートにもマッチしない URL 用（公開レイアウトの外側）
 */
export default function NotFound() {
  return (
    <main className="px-4">
      <NotFoundView />
    </main>
  )
}
