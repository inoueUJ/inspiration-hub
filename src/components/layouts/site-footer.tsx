import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-foreground">Inspiration Hub</span> — 毎日の言葉が、明日のあなたをつくる。
        </p>
        <nav aria-label="フッター" className="flex gap-5">
          <Link href="/" className="hover:text-foreground">今日の名言</Link>
          <Link href="/search" className="hover:text-foreground">検索</Link>
          <Link href="/bookmarks" className="hover:text-foreground">ブックマーク</Link>
          <Link href="/submit" className="hover:text-foreground">名言を投稿</Link>
        </nav>
      </div>
    </footer>
  )
}
