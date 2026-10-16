import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"

interface Crumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  breadcrumbs?: Crumb[]
  children?: ReactNode
}

/**
 * ページ見出し（パンくず付き）- Server Component
 */
export function PageHeader({ title, description, eyebrow, breadcrumbs, children }: PageHeaderProps) {
  return (
    <header className="mb-10 space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="パンくずリスト">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight aria-hidden className="size-3.5" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <div className="text-sm font-medium text-primary">{eyebrow}</div>}
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-muted-foreground text-pretty">{description}</p>}
      {children}
    </header>
  )
}
