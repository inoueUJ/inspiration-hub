import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

/**
 * 名言の本文用の明朝体
 * 日本語フォントはサブセットが巨大なため preload せず、unicode-range で必要分だけ読み込ませる
 */
const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: ["400", "600"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Inspiration Hub - 今日の名言",
    template: "%s | Inspiration Hub",
  },
  description:
    "偉人・アニメ・映画のキャラクターの名言を、毎日30件お届けする自己啓発のための名言コレクション。",
  applicationName: "Inspiration Hub",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14161d" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJp.variable} min-h-dvh font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
