import { cn } from "@/lib/utils"
import { hashString } from "@/lib/utils/date"

/**
 * 名前から決定的に選ぶ配色（Tailwind のクラスとして静的に列挙しておく）
 */
const PALETTES = [
  "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
  "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-200",
] as const

interface AuthorAvatarProps {
  name: string
  className?: string
}

/**
 * 人物のイニシャルアバター
 * 同じ人物は常に同じ色になる（将来 author_images が実装されたら画像に差し替える）
 */
export function AuthorAvatar({ name, className }: AuthorAvatarProps) {
  const palette = PALETTES[hashString(name) % PALETTES.length]

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full font-serif text-lg font-semibold",
        palette,
        className
      )}
    >
      {Array.from(name)[0]}
    </span>
  )
}
