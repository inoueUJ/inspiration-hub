import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Quote } from "@/types/quote"

interface QuoteCardProps {
  quote: Quote
  variant?: "default" | "compact"
  showCategory?: boolean
}

/**
 * 名言カード - Server Component
 * データ表示のみでインタラクティビティなし
 */
export function QuoteCard({
  quote,
  variant = "default",
  showCategory = true,
}: QuoteCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className={variant === "compact" ? "p-4" : "p-6"}>
        {showCategory && (
          <div className="mb-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link
              href={`/subcategory/${quote.subcategory.id}`}
              className="hover:text-primary hover:underline"
            >
              {quote.subcategory.name}
            </Link>
            <span>•</span>
            <Link
              href={`/author/${quote.author.id}`}
              className="hover:text-primary hover:underline"
            >
              {quote.author.name}
            </Link>
          </div>
        )}
        <p className={variant === "compact" ? "text-base" : "text-lg"}>
          {quote.textJa || quote.text}
        </p>
      </CardContent>
    </Card>
  )
}
