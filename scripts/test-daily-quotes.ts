import {
  generateDailyQuotes,
  getDailyQuotes,
} from "../src/lib/data/daily-quotes"
import { getDateKey } from "../src/lib/utils/date"

const EXPECTED_DAILY_QUOTES = 30

async function test() {
  console.log("📅 Testing daily quotes generation...")

  const today = getDateKey()
  console.log(`Date: ${today}`)

  // 1. 日替わり名言を生成
  console.log("\n1️⃣ Generating daily quotes...")
  const count = await generateDailyQuotes(today)
  console.log(`✅ Generated ${count} daily quotes`)

  // 生成数のバリデーション
  if (count !== EXPECTED_DAILY_QUOTES) {
    console.warn(
      `⚠️ Expected ${EXPECTED_DAILY_QUOTES} quotes, but generated ${count}`
    )
  }

  // 2. 取得して確認
  console.log("\n2️⃣ Retrieving daily quotes...")
  const quotes = await getDailyQuotes(today)
  console.log(`✅ Retrieved ${quotes.length} quotes`)

  // 取得数のバリデーション
  if (quotes.length !== count) {
    console.error(`❌ Mismatch: Generated ${count} but retrieved ${quotes.length}`)
    process.exit(1)
  }

  if (quotes.length > 0) {
    console.log("\n📝 First 3 quotes:")
    quotes.slice(0, 3).forEach((q: typeof quotes[number], i: number) => {
      console.log(`${i + 1}. ${q.textJa || q.text} - ${q.author.name}`)
    })
  }

  console.log("\n🎉 Test completed successfully!")
}

test()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error)
    process.exit(1)
  })
