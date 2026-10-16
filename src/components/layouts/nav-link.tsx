"use client"

import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string
  /** true の場合は完全一致のときだけアクティブ */
  exact?: boolean
}

/**
 * アクティブ状態と遷移中インジケーターを持つナビゲーションリンク
 * - usePathname で現在地を判定し aria-current を付与
 * - useLinkStatus（Next.js 15.3+）で「このリンクの遷移が保留中か」を子コンポーネントから購読
 */
export function NavLink({ href, exact = false, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-foreground aria-[current=page]:text-background",
        className
      )}
      {...props}
    >
      {children}
      <PendingIndicator />
    </Link>
  )
}

/**
 * useLinkStatus は <Link> の子孫でのみ利用できる
 */
function PendingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary opacity-0 transition-opacity",
        pending && "animate-pulse opacity-100 delay-100"
      )}
    />
  )
}
