"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorViewProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * エラーバウンダリの表示（error.tsx から使用）
 *
 * reset() だけではクライアント側で再レンダリングするだけなので、Server Component の
 * データ取得で起きたエラーは直らない。router.refresh() でサーバーから再取得し、
 * その完了と同じ transition 内で reset() することで「取得し直してから復帰」させる。
 */
export function ErrorView({ error, reset }: ErrorViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function retry(): void {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-5 py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle aria-hidden className="size-7" />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">読み込みに失敗しました</h1>
        <p className="text-sm text-muted-foreground">
          通信状況をご確認のうえ、もう一度お試しください。
          {error.digest && <span className="mt-1 block font-mono text-xs">Error ID: {error.digest}</span>}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={retry} disabled={isPending} aria-busy={isPending}>
          {isPending ? <Loader2 aria-hidden className="animate-spin" /> : <RotateCcw aria-hidden />}
          再読み込み
        </Button>
        <Button asChild variant="outline">
          <Link href="/">トップへ戻る</Link>
        </Button>
      </div>
    </div>
  )
}
