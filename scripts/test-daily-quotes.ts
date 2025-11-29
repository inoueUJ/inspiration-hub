import { generateDailyQuotes, getDailyQuotes } from "../src/lib/db/queries/daily-quotes"

async function test() {
  console.log("📅 Testing daily quotes generation...")

  const today = new Date().toISOString().split("T")[0]
  console.log(`Date: ${today}`)

  // 1. 日替わり名言を生成
  console.log("\n1️⃣ Generating daily quotes...")
  const count = await generateDailyQuotes(today)
  console.log(`✅ Generated ${count} daily quotes`)

  // 2. 取得して確認
  console.log("\n2️⃣ Retrieving daily quotes...")
  const quotes = await getDailyQuotes(today)
  console.log(`✅ Retrieved ${quotes.length} quotes`)

  if (quotes.length > 0) {
    console.log("\n📝 First 3 quotes:")
    quotes.slice(0, 3).forEach((q, i) => {
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
