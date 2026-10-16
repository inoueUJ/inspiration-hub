"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * テーマ切り替え
 *
 * アイコンの出し分けを JS（resolvedTheme）ではなく CSS の dark: バリアントで行うため、
 * 「マウント済みかどうか」を useEffect で判定する定番の回避策が不要で、
 * ハイドレーションのミスマッチも起きない。
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="ライト / ダークテーマを切り替え"
      title="テーマを切り替え"
    >
      <Sun aria-hidden className="size-[1.15rem] dark:hidden" />
      <Moon aria-hidden className="hidden size-[1.15rem] dark:block" />
    </Button>
  )
}
