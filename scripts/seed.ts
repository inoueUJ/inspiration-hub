import { getDb } from "../src/lib/db/client"
import {
  categories,
  subcategories,
  authors,
  quotes,
} from "../src/lib/db/schema"

async function seed() {
  console.log("🌱 Seeding database...")

  const db = getDb()

  // カテゴリ作成
  const [category1] = await db
    .insert(categories)
    .values({ name: "偉人" })
    .returning()
  console.log("✅ Created category:", category1.name)

  const [category2] = await db
    .insert(categories)
    .values({ name: "アニメ" })
    .returning()
  console.log("✅ Created category:", category2.name)

  // 中項目作成
  const [subcategory1] = await db
    .insert(subcategories)
    .values({ categoryId: category1.id, name: "哲学者" })
    .returning()
  console.log("✅ Created subcategory:", subcategory1.name)

  const [subcategory2] = await db
    .insert(subcategories)
    .values({ categoryId: category1.id, name: "科学者" })
    .returning()
  console.log("✅ Created subcategory:", subcategory2.name)

  const [subcategory3] = await db
    .insert(subcategories)
    .values({ categoryId: category2.id, name: "主人公" })
    .returning()
  console.log("✅ Created subcategory:", subcategory3.name)

  // 人物作成
  const [author1] = await db
    .insert(authors)
    .values({ name: "ソクラテス" })
    .returning()
  console.log("✅ Created author:", author1.name)

  const [author2] = await db
    .insert(authors)
    .values({ name: "アインシュタイン" })
    .returning()
  console.log("✅ Created author:", author2.name)

  const [author3] = await db
    .insert(authors)
    .values({ name: "ルフィ" })
    .returning()
  console.log("✅ Created author:", author3.name)

  // 名言作成
  const quotesData = [
    // ソクラテス
    {
      text: "The only true wisdom is in knowing you know nothing.",
      textJa: "無知の知こそが真の知恵である。",
      authorId: author1.id,
      subcategoryId: subcategory1.id,
      background: "ソクラテスの有名な言葉で、自分の無知を自覚することの重要性を説いています。",
    },
    {
      text: "An unexamined life is not worth living.",
      textJa: "吟味されない生は生きるに値しない。",
      authorId: author1.id,
      subcategoryId: subcategory1.id,
      background: "アテナイの裁判でソクラテスが語った言葉。自己省察の重要性を示しています。",
    },
    {
      text: "To find yourself, think for yourself.",
      textJa: "自分自身を見つけるには、自分で考えなければならない。",
      authorId: author1.id,
      subcategoryId: subcategory1.id,
    },
    // アインシュタイン
    {
      text: "Imagination is more important than knowledge.",
      textJa: "想像力は知識よりも重要である。",
      authorId: author2.id,
      subcategoryId: subcategory2.id,
      background:
        "アインシュタインは想像力こそが新しい発見の源泉であると考えていました。",
    },
    {
      text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
      textJa: "人生は自転車に乗るようなものだ。バランスを保つには、動き続けなければならない。",
      authorId: author2.id,
      subcategoryId: subcategory2.id,
    },
    {
      text: "The important thing is not to stop questioning.",
      textJa: "大切なのは、疑問を持ち続けることである。",
      authorId: author2.id,
      subcategoryId: subcategory2.id,
    },
    // ルフィ
    {
      text: "I'm gonna be King of the Pirates!",
      textJa: "海賊王に、おれはなる！",
      authorId: author3.id,
      subcategoryId: subcategory3.id,
      background: "ワンピースの主人公モンキー・D・ルフィの決め台詞。",
    },
    {
      text: "When do you think people die? When they are forgotten.",
      textJa: "人はいつ死ぬと思う？人に忘れられた時さ。",
      authorId: author3.id,
      subcategoryId: subcategory3.id,
      background: "ドクター・ヒルルクの名言をルフィが引用したもの。",
    },
    {
      text: "I don't wanna conquer anything. I just think the guy with the most freedom in this whole ocean is the Pirate King!",
      textJa: "おれは別に何かを征服したいわけじゃねェんだ。この海で一番自由な奴が海賊王だ！",
      authorId: author3.id,
      subcategoryId: subcategory3.id,
    },
  ]

  for (const quoteData of quotesData) {
    const [quote] = await db.insert(quotes).values(quoteData).returning()
    console.log("✅ Created quote:", quote.textJa?.slice(0, 30) + "...")
  }

  console.log("🎉 Seeding completed!")
  console.log(`📊 Created:`)
  console.log(`   - ${2} categories`)
  console.log(`   - ${3} subcategories`)
  console.log(`   - ${3} authors`)
  console.log(`   - ${quotesData.length} quotes`)
}

seed()
  .then(() => {
    console.log("✨ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  })
