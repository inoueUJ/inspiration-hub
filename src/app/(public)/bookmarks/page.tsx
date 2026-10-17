import type { Metadata } from "next"
import { getViewerLikedQuoteIds } from "@/lib/data/viewer"
import { PageHeader } from "@/components/layouts/page-header"
import { BookmarksView } from "@/components/features/bookmarks/bookmarks-view"

export const metadata: Metadata = {
  title: "ブックマーク",
  robots: { index: false },
}

export default async function BookmarksPage() {
  const likedIds = await getViewerLikedQuoteIds()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "ブックマーク" }]}
        title="ブックマーク"
        description="保存した名言はこのブラウザに記録され、別のタブとも自動で同期されます。"
      />
      <BookmarksView likedIds={likedIds} />
    </>
  )
}
