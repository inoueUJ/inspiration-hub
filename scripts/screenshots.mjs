#!/usr/bin/env node
/**
 * 主要画面のスクリーンショットを撮影する（PR に動作画面を貼るため）
 *
 * 使い方:
 *   npm run dev                      # 別ターミナルで起動しておく
 *   npm run screenshots              # → screenshots/*.png と screenshots/manifest.json
 *
 * オプション:
 *   --base-url <url>   撮影対象（既定: http://localhost:3000 / 環境変数 BASE_URL）
 *   --out <dir>        出力先（既定: screenshots）
 *
 * 撮影中にコンソールエラーやページ例外が出た場合は終了コード 1 で終わるため、
 * CI ではスモークテストとしても機能する。
 */
import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { parseArgs } from "node:util"
import { chromium } from "playwright"

const { values: args } = parseArgs({
  options: {
    "base-url": { type: "string", default: process.env.BASE_URL ?? "http://localhost:3000" },
    out: { type: "string", default: "screenshots" },
  },
})

const BASE_URL = args["base-url"].replace(/\/$/, "")
const OUT_DIR = path.resolve(args.out)

const DESKTOP = { viewport: { width: 1280, height: 900 } }
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }

/**
 * 撮影シナリオ
 * - name: ファイル名（英数字）
 * - title: PR コメントに表示する見出し
 * - prepare: 撮影前の操作（任意）
 */
const SCENARIOS = [
  { name: "top", title: "TOP（今日の一言・30選）", path: "/", context: DESKTOP, fullPage: true },
  {
    name: "top-filter",
    title: "TOP：カテゴリタブで絞り込み",
    path: "/",
    context: DESKTOP,
    prepare: async (page) => {
      const tabs = page.getByRole("group", { name: "カテゴリで絞り込む" }).getByRole("button")
      await tabs.nth(1).click()
      await page.waitForTimeout(400)
      // 固定ヘッダーの高さ分を空けて「今日の30選」までスクロール
      await page.locator("#daily-heading").evaluate((heading) => {
        window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 140)
      })
    },
  },
  {
    name: "quote-dialog",
    title: "名言ダイアログ",
    path: "/",
    context: DESKTOP,
    prepare: async (page) => {
      await page.locator("#main article blockquote a").first().click()
      await page.getByRole("dialog").waitFor()
      await page.waitForTimeout(400)
    },
  },
  { name: "category", title: "カテゴリページ", path: "/category/1", context: DESKTOP, fullPage: true },
  { name: "author", title: "人物ページ", path: "/author/1", context: DESKTOP, fullPage: true },
  { name: "quote", title: "名言詳細ページ", path: "/quote/1", context: DESKTOP, fullPage: true },
  {
    name: "search",
    title: "検索（インクリメンタル）",
    path: "/search",
    context: DESKTOP,
    prepare: async (page) => {
      await page.locator("#search-query").pressSequentially("主人公", { delay: 40 })
      await page.waitForURL(/q=/)
      await page.waitForLoadState("networkidle")
      await page.locator("#results-heading").waitFor()
    },
  },
  {
    name: "submit-validation",
    title: "投稿フォーム（バリデーション）",
    path: "/submit",
    context: DESKTOP,
    fullPage: true,
    prepare: async (page) => {
      await page.getByRole("button", { name: "名言を投稿する" }).click()
      await page.locator("[aria-invalid=true]").first().waitFor()
    },
  },
  {
    name: "top-mobile-dark",
    title: "TOP（モバイル・ダークモード）",
    path: "/",
    context: { ...MOBILE, colorScheme: "dark" },
  },
]

/** Next.js 開発サーバーのインジケーターなど、撮影に不要な要素を隠す */
const HIDE_DEV_OVERLAY_CSS = "nextjs-portal { display: none !important; }"

async function capture(browser, scenario, problems) {
  const context = await browser.newContext({ locale: "ja-JP", ...scenario.context })
  const page = await context.newPage()

  page.on("console", (message) => {
    if (message.type() === "error") {
      problems.push(`[${scenario.name}] console.error: ${message.text().slice(0, 500)}`)
    }
  })
  page.on("pageerror", (error) => {
    problems.push(`[${scenario.name}] pageerror: ${error.message}`)
  })

  const response = await page.goto(BASE_URL + scenario.path, { waitUntil: "networkidle" })
  if (!response || response.status() >= 400) {
    problems.push(`[${scenario.name}] HTTP ${response?.status() ?? "no response"} for ${scenario.path}`)
  }

  await page.addStyleTag({ content: HIDE_DEV_OVERLAY_CSS })
  await scenario.prepare?.(page)

  // 全体キャプチャ時にスクロール位置が残っていると、固定ヘッダーが途中に写り込む
  if (scenario.fullPage) {
    await page.evaluate(() => window.scrollTo(0, 0))
  }

  const file = `${scenario.name}.png`
  await page.screenshot({
    path: path.join(OUT_DIR, file),
    fullPage: scenario.fullPage ?? false,
    animations: "disabled",
    // 既定の caret: "hide" はスタイルを注入するため、ハイドレーション前だと不一致の原因になる
    caret: "initial",
  })
  await context.close()

  return { name: scenario.name, title: scenario.title, path: scenario.path, file }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch()
  const problems = []
  const shots = []

  try {
    for (const scenario of SCENARIOS) {
      process.stdout.write(`📸 ${scenario.name} (${scenario.path}) ... `)
      shots.push(await capture(browser, scenario, problems))
      process.stdout.write("done\n")
    }
  } finally {
    await browser.close()
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify({ baseUrl: BASE_URL, capturedAt: new Date().toISOString(), shots, problems }, null, 2)}\n`
  )

  if (problems.length > 0) {
    console.error(`\n❌ ${problems.length} problem(s) detected:\n${problems.join("\n")}`)
    process.exitCode = 1
    return
  }
  console.log(`\n✅ ${shots.length} screenshots saved to ${path.relative(process.cwd(), OUT_DIR)}/`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
