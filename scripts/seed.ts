import { getDb } from "../src/lib/db/client"
import {
  categories,
  subcategories,
  authors,
  quotes,
} from "../src/lib/db/schema"

async function seed() {
  console.log("🌱 Seeding database...")

  const db = await getDb()

  // ========================
  // カテゴリ作成（5つ）
  // ========================
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

  const [category3] = await db
    .insert(categories)
    .values({ name: "映画" })
    .returning()
  console.log("✅ Created category:", category3.name)

  const [category4] = await db
    .insert(categories)
    .values({ name: "ビジネス" })
    .returning()
  console.log("✅ Created category:", category4.name)

  const [category5] = await db
    .insert(categories)
    .values({ name: "スポーツ" })
    .returning()
  console.log("✅ Created category:", category5.name)

  // ========================
  // 中項目作成（12個）
  // ========================
  // 偉人
  const [sub1] = await db
    .insert(subcategories)
    .values({ categoryId: category1.id, name: "哲学者" })
    .returning()
  const [sub2] = await db
    .insert(subcategories)
    .values({ categoryId: category1.id, name: "科学者" })
    .returning()
  const [sub3] = await db
    .insert(subcategories)
    .values({ categoryId: category1.id, name: "政治家" })
    .returning()

  // アニメ
  const [sub4] = await db
    .insert(subcategories)
    .values({ categoryId: category2.id, name: "主人公" })
    .returning()
  const [sub5] = await db
    .insert(subcategories)
    .values({ categoryId: category2.id, name: "サポートキャラ" })
    .returning()

  // 映画
  const [sub6] = await db
    .insert(subcategories)
    .values({ categoryId: category3.id, name: "アクション" })
    .returning()
  const [sub7] = await db
    .insert(subcategories)
    .values({ categoryId: category3.id, name: "ドラマ" })
    .returning()

  // ビジネス
  const [sub8] = await db
    .insert(subcategories)
    .values({ categoryId: category4.id, name: "起業家" })
    .returning()
  const [sub9] = await db
    .insert(subcategories)
    .values({ categoryId: category4.id, name: "経営者" })
    .returning()

  // スポーツ
  const [sub10] = await db
    .insert(subcategories)
    .values({ categoryId: category5.id, name: "バスケットボール" })
    .returning()
  const [sub11] = await db
    .insert(subcategories)
    .values({ categoryId: category5.id, name: "サッカー" })
    .returning()

  console.log("✅ Created 11 subcategories")

  // ========================
  // 人物作成（15人）
  // ========================
  const [author1] = await db.insert(authors).values({ name: "ソクラテス" }).returning()
  const [author2] = await db.insert(authors).values({ name: "プラトン" }).returning()
  const [author3] = await db.insert(authors).values({ name: "アインシュタイン" }).returning()
  const [author4] = await db.insert(authors).values({ name: "ニュートン" }).returning()
  const [author5] = await db.insert(authors).values({ name: "ガンディー" }).returning()
  const [author6] = await db.insert(authors).values({ name: "リンカーン" }).returning()
  const [author7] = await db.insert(authors).values({ name: "ルフィ" }).returning()
  const [author8] = await db.insert(authors).values({ name: "ナルト" }).returning()
  const [author9] = await db.insert(authors).values({ name: "孫悟空" }).returning()
  const [author10] = await db.insert(authors).values({ name: "トニー・スターク" }).returning()
  const [author11] = await db.insert(authors).values({ name: "フォレスト・ガンプ" }).returning()
  const [author12] = await db.insert(authors).values({ name: "スティーブ・ジョブズ" }).returning()
  const [author13] = await db.insert(authors).values({ name: "イーロン・マスク" }).returning()
  const [author14] = await db.insert(authors).values({ name: "マイケル・ジョーダン" }).returning()
  const [author15] = await db.insert(authors).values({ name: "ペレ" }).returning()

  console.log("✅ Created 15 authors")

  // ========================
  // 名言作成（50件以上）
  // ========================
  const quotesData = [
    // ソクラテス（哲学者）
    {
      text: "The only true wisdom is in knowing you know nothing.",
      textJa: "無知の知こそが真の知恵である。",
      authorId: author1.id,
      subcategoryId: sub1.id,
      background: "ソクラテスの有名な言葉で、自分の無知を自覚することの重要性を説いています。",
    },
    {
      text: "An unexamined life is not worth living.",
      textJa: "吟味されない生は生きるに値しない。",
      authorId: author1.id,
      subcategoryId: sub1.id,
      background: "アテナイの裁判でソクラテスが語った言葉。自己省察の重要性を示しています。",
    },
    {
      text: "To find yourself, think for yourself.",
      textJa: "自分自身を見つけるには、自分で考えなければならない。",
      authorId: author1.id,
      subcategoryId: sub1.id,
    },
    {
      text: "Be kind, for everyone you meet is fighting a hard battle.",
      textJa: "親切であれ。あなたが出会う全ての人は厳しい戦いをしている。",
      authorId: author1.id,
      subcategoryId: sub1.id,
    },

    // プラトン（哲学者）
    {
      text: "The measure of a man is what he does with power.",
      textJa: "人の価値は、その人が権力を持った時にどう振る舞うかで決まる。",
      authorId: author2.id,
      subcategoryId: sub1.id,
    },
    {
      text: "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.",
      textJa: "暗闇を恐れる子供は簡単に許せる。人生の真の悲劇は、大人が光を恐れることだ。",
      authorId: author2.id,
      subcategoryId: sub1.id,
    },
    {
      text: "Wise men speak because they have something to say; fools because they have to say something.",
      textJa: "賢者は言うべきことがあるから話す。愚者は何か言わねばならぬから話す。",
      authorId: author2.id,
      subcategoryId: sub1.id,
    },

    // アインシュタイン（科学者）
    {
      text: "Imagination is more important than knowledge.",
      textJa: "想像力は知識よりも重要である。",
      authorId: author3.id,
      subcategoryId: sub2.id,
      background: "アインシュタインは想像力こそが新しい発見の源泉であると考えていました。",
    },
    {
      text: "Life is like riding a bicycle. To keep your balance, you must keep moving.",
      textJa: "人生は自転車に乗るようなものだ。バランスを保つには、動き続けなければならない。",
      authorId: author3.id,
      subcategoryId: sub2.id,
    },
    {
      text: "The important thing is not to stop questioning.",
      textJa: "大切なのは、疑問を持ち続けることである。",
      authorId: author3.id,
      subcategoryId: sub2.id,
    },
    {
      text: "Try not to become a man of success, but rather try to become a man of value.",
      textJa: "成功者になろうとするな。価値ある人間になろうとせよ。",
      authorId: author3.id,
      subcategoryId: sub2.id,
    },

    // ニュートン（科学者）
    {
      text: "If I have seen further it is by standing on the shoulders of Giants.",
      textJa: "私がさらに遠くを見ることができたのは、巨人の肩の上に立っていたからだ。",
      authorId: author4.id,
      subcategoryId: sub2.id,
    },
    {
      text: "I can calculate the motion of heavenly bodies, but not the madness of people.",
      textJa: "天体の動きは計算できるが、人々の狂気は計算できない。",
      authorId: author4.id,
      subcategoryId: sub2.id,
    },
    {
      text: "What we know is a drop, what we don't know is an ocean.",
      textJa: "私たちが知っていることは一滴の水、知らないことは大海である。",
      authorId: author4.id,
      subcategoryId: sub2.id,
    },

    // ガンディー（政治家）
    {
      text: "Be the change that you wish to see in the world.",
      textJa: "世界に望む変化に、あなた自身がなりなさい。",
      authorId: author5.id,
      subcategoryId: sub3.id,
    },
    {
      text: "The weak can never forgive. Forgiveness is the attribute of the strong.",
      textJa: "弱い者は許すことができない。許しは強い者の特性である。",
      authorId: author5.id,
      subcategoryId: sub3.id,
    },
    {
      text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
      textJa: "明日死ぬかのように生きよ。永遠に生きるかのように学べ。",
      authorId: author5.id,
      subcategoryId: sub3.id,
    },

    // リンカーン（政治家）
    {
      text: "The best way to predict your future is to create it.",
      textJa: "未来を予測する最良の方法は、それを創ることだ。",
      authorId: author6.id,
      subcategoryId: sub3.id,
    },
    {
      text: "Whatever you are, be a good one.",
      textJa: "何であれ、良いものであれ。",
      authorId: author6.id,
      subcategoryId: sub3.id,
    },
    {
      text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.",
      textJa: "ほとんどの人は逆境に耐えられる。だが人の性格を試したいなら、権力を与えてみよ。",
      authorId: author6.id,
      subcategoryId: sub3.id,
    },

    // ルフィ（アニメ主人公）
    {
      text: "I'm gonna be King of the Pirates!",
      textJa: "海賊王に、おれはなる！",
      authorId: author7.id,
      subcategoryId: sub4.id,
      background: "ワンピースの主人公モンキー・D・ルフィの決め台詞。",
    },
    {
      text: "When do you think people die? When they are forgotten.",
      textJa: "人はいつ死ぬと思う？人に忘れられた時さ。",
      authorId: author7.id,
      subcategoryId: sub4.id,
      background: "ドクター・ヒルルクの名言をルフィが引用したもの。",
    },
    {
      text: "I don't wanna conquer anything. I just think the guy with the most freedom in this whole ocean is the Pirate King!",
      textJa: "おれは別に何かを征服したいわけじゃねェんだ。この海で一番自由な奴が海賊王だ！",
      authorId: author7.id,
      subcategoryId: sub4.id,
    },

    // ナルト（アニメ主人公）
    {
      text: "I'm not gonna run away, I never go back on my word! That's my nindō: my ninja way!",
      textJa: "逃げ出さない、俺は自分の言葉を曲げない！それが俺の忍道だ！",
      authorId: author8.id,
      subcategoryId: sub4.id,
    },
    {
      text: "If you don't like your destiny, don't accept it. Instead have the courage to change it the way you want it to be.",
      textJa: "自分の運命が気に入らないなら、受け入れるな。変える勇気を持て。",
      authorId: author8.id,
      subcategoryId: sub4.id,
    },
    {
      text: "Hard work is worthless for those that don't believe in themselves.",
      textJa: "自分を信じない者に努力は無駄だ。",
      authorId: author8.id,
      subcategoryId: sub4.id,
    },

    // 孫悟空（アニメ主人公）
    {
      text: "I am the hope of the universe. I am the answer to all living things that cry out for peace!",
      textJa: "オラは宇宙の希望だ。平和を求める全ての生命の答えだ！",
      authorId: author9.id,
      subcategoryId: sub4.id,
    },
    {
      text: "Power comes in response to a need, not a desire.",
      textJa: "力は欲望からではなく、必要性から生まれる。",
      authorId: author9.id,
      subcategoryId: sub4.id,
    },
    {
      text: "I would rather be a brainless beast than a heartless monster.",
      textJa: "心のない怪物になるくらいなら、頭のない獣になった方がマシだ。",
      authorId: author9.id,
      subcategoryId: sub4.id,
    },

    // トニー・スターク（映画アクション）
    {
      text: "Sometimes you gotta run before you can walk.",
      textJa: "時には、歩く前に走らなければならないこともある。",
      authorId: author10.id,
      subcategoryId: sub6.id,
    },
    {
      text: "I am Iron Man.",
      textJa: "私はアイアンマンだ。",
      authorId: author10.id,
      subcategoryId: sub6.id,
    },
    {
      text: "We create our own demons.",
      textJa: "我々は自分自身の悪魔を創り出している。",
      authorId: author10.id,
      subcategoryId: sub6.id,
    },

    // フォレスト・ガンプ（映画ドラマ）
    {
      text: "Life is like a box of chocolates. You never know what you're gonna get.",
      textJa: "人生はチョコレートの箱のようなもの。何が出るかわからない。",
      authorId: author11.id,
      subcategoryId: sub7.id,
    },
    {
      text: "Stupid is as stupid does.",
      textJa: "バカなことをするやつがバカなんだ。",
      authorId: author11.id,
      subcategoryId: sub7.id,
    },
    {
      text: "My mama always said, 'You've got to put the past behind you before you can move on.'",
      textJa: "ママはいつも言っていた。前に進むには、過去を置き去りにしなければならないと。",
      authorId: author11.id,
      subcategoryId: sub7.id,
    },

    // スティーブ・ジョブズ（起業家）
    {
      text: "Stay hungry, stay foolish.",
      textJa: "ハングリーであれ、愚かであれ。",
      authorId: author12.id,
      subcategoryId: sub8.id,
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      textJa: "イノベーションがリーダーと追随者を分ける。",
      authorId: author12.id,
      subcategoryId: sub8.id,
    },
    {
      text: "Your time is limited, so don't waste it living someone else's life.",
      textJa: "あなたの時間は限られている。他人の人生を生きて無駄にしてはいけない。",
      authorId: author12.id,
      subcategoryId: sub8.id,
    },
    {
      text: "The only way to do great work is to love what you do.",
      textJa: "素晴らしい仕事をする唯一の方法は、自分のやっていることを愛することだ。",
      authorId: author12.id,
      subcategoryId: sub8.id,
    },

    // イーロン・マスク（起業家）
    {
      text: "When something is important enough, you do it even if the odds are not in your favor.",
      textJa: "何かが十分に重要なら、たとえ勝算がなくてもやるべきだ。",
      authorId: author13.id,
      subcategoryId: sub8.id,
    },
    {
      text: "Failure is an option here. If things are not failing, you are not innovating enough.",
      textJa: "失敗は選択肢の一つだ。失敗していないなら、十分にイノベーションしていない。",
      authorId: author13.id,
      subcategoryId: sub8.id,
    },
    {
      text: "I think it's possible for ordinary people to choose to be extraordinary.",
      textJa: "普通の人が非凡になることを選ぶことは可能だと思う。",
      authorId: author13.id,
      subcategoryId: sub8.id,
    },

    // マイケル・ジョーダン（バスケットボール）
    {
      text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. I've failed over and over again. And that is why I succeed.",
      textJa: "私はキャリアで9,000本以上のシュートを外した。300試合近く負けた。何度も何度も失敗した。だから私は成功したんだ。",
      authorId: author14.id,
      subcategoryId: sub10.id,
    },
    {
      text: "Talent wins games, but teamwork and intelligence win championships.",
      textJa: "才能は試合に勝つ。しかしチームワークと知性が優勝をもたらす。",
      authorId: author14.id,
      subcategoryId: sub10.id,
    },
    {
      text: "If you quit once, it becomes a habit. Never quit.",
      textJa: "一度諦めると、それが習慣になる。決して諦めるな。",
      authorId: author14.id,
      subcategoryId: sub10.id,
    },

    // ペレ（サッカー）
    {
      text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
      textJa: "成功は偶然ではない。努力、忍耐、学習、研究、犠牲、そして何より、自分のやっていることへの愛だ。",
      authorId: author15.id,
      subcategoryId: sub11.id,
    },
    {
      text: "Everything is practice.",
      textJa: "全ては練習だ。",
      authorId: author15.id,
      subcategoryId: sub11.id,
    },
    {
      text: "The more difficult the victory, the greater the happiness in winning.",
      textJa: "勝利が困難であるほど、勝った時の喜びは大きい。",
      authorId: author15.id,
      subcategoryId: sub11.id,
    },
  ]

  for (const quoteData of quotesData) {
    const [quote] = await db.insert(quotes).values(quoteData).returning()
    console.log("✅ Created quote:", quote.textJa?.slice(0, 30) + "...")
  }

  console.log("🎉 Seeding completed!")
  console.log(`📊 Created:`)
  console.log(`   - 5 categories`)
  console.log(`   - 11 subcategories`)
  console.log(`   - 15 authors`)
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
