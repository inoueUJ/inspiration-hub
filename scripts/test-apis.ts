/**
 * API動作確認スクリプト
 * すべてのAPIエンドポイントをテストします
 */

import { getDb } from "../src/lib/db/client"
import { getDailyQuotes, generateDailyQuotes } from "../src/lib/db/queries/daily-quotes"
import { getAllCategories } from "../src/lib/db/queries/categories"
import { getAllSubcategories } from "../src/lib/db/queries/subcategories"
import { getAllAuthors } from "../src/lib/db/queries/authors"
import { getAllQuotes, searchQuotes } from "../src/lib/db/queries/quotes"

async function testAPIs() {
  console.log("🧪 API動作確認を開始します...\n")

  try {
    // 1. カテゴリAPI
    console.log("1️⃣ カテゴリAPI")
    const categories = await getAllCategories()
    console.log(`   ✅ カテゴリ取得: ${categories.length}件`)
    console.log(`   📋 カテゴリ: ${categories.map(c => c.name).join(", ")}\n`)

    // 2. 中項目API
    console.log("2️⃣ 中項目API")
    const subcategories = await getAllSubcategories()
    console.log(`   ✅ 中項目取得: ${subcategories.length}件\n`)

    // 3. 人物API
    console.log("3️⃣ 人物API")
    const authors = await getAllAuthors()
    console.log(`   ✅ 人物取得: ${authors.length}件`)
    console.log(`   👤 人物: ${authors.slice(0, 5).map(a => a.name).join(", ")}...\n`)

    // 4. 名言API
    console.log("4️⃣ 名言API")
    const quotes = await getAllQuotes()
    console.log(`   ✅ 名言取得: ${quotes.length}件`)
    if (quotes.length > 0) {
      console.log(`   💬 最新の名言: "${quotes[0].textJa || quotes[0].text}" - ${quotes[0].author.name}\n`)
    }

    // 5. 検索API
    console.log("5️⃣ 検索API")
    const searchResults = await searchQuotes("知")
    console.log(`   ✅ 検索結果("知"): ${searchResults.length}件\n`)

    // 6. 日替わり名言生成
    console.log("6️⃣ 日替わり名言API")
    const today = new Date().toISOString().split("T")[0]

    // 今日の日替わり名言を生成
    const count = await generateDailyQuotes(today)
    console.log(`   ✅ 日替わり名言生成: ${count}件`)

    // 生成した名言を取得
    const dailyQuotes = await getDailyQuotes(today)
    console.log(`   ✅ 日替わり名言取得: ${dailyQuotes.length}件`)

    if (dailyQuotes.length > 0) {
      console.log(`   💬 今日の1つ目: "${dailyQuotes[0].textJa || dailyQuotes[0].text}" - ${dailyQuotes[0].author.name}\n`)
    }

    // 7. 統計情報
    console.log("📊 統計情報")
    console.log(`   カテゴリ数: ${categories.length}`)
    console.log(`   中項目数: ${subcategories.length}`)
    console.log(`   人物数: ${authors.length}`)
    console.log(`   名言総数: ${quotes.length}`)
    console.log(`   今日の名言: ${dailyQuotes.length}件\n`)

    console.log("✅ すべてのAPI動作確認が完了しました！")

  } catch (error) {
    console.error("❌ エラーが発生しました:", error)
    process.exit(1)
  }
}

testAPIs()
