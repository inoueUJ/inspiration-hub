import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundView() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Compass aria-hidden className="size-7" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">ページが見つかりませんでした</h1>
        <p className="font-serif text-muted-foreground">
          「道に迷うことこそ、道を知ることだ。」
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">今日の名言へ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">名言を検索</Link>
        </Button>
      </div>
    </div>
  )
}
