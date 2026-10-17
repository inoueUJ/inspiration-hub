interface HighlightProps {
  text: string
  query?: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * 検索語に一致する部分を <mark> で強調表示
 */
export function Highlight({ text, query }: HighlightProps) {
  const keyword = query?.trim()
  if (!keyword) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, "gi"))

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-sm bg-primary/20 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
