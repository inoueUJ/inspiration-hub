-- カテゴリの作成
INSERT INTO categories (name) VALUES ('偉人');
INSERT INTO categories (name) VALUES ('アニメ');

-- 中項目の作成
INSERT INTO subcategories (category_id, name) VALUES (1, '哲学者');
INSERT INTO subcategories (category_id, name) VALUES (1, '科学者');
INSERT INTO subcategories (category_id, name) VALUES (2, '主人公');

-- 人物の作成
INSERT INTO authors (name) VALUES ('ソクラテス');
INSERT INTO authors (name) VALUES ('アインシュタイン');
INSERT INTO authors (name) VALUES ('ルフィ');

-- 名言の作成
-- ソクラテス
INSERT INTO quotes (text, text_ja, author_id, subcategory_id, background) VALUES (
  'The only true wisdom is in knowing you know nothing.',
  '無知の知こそが真の知恵である。',
  1,
  1,
  'ソクラテスの有名な言葉で、自分の無知を自覚することの重要性を説いています。'
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id, background) VALUES (
  'An unexamined life is not worth living.',
  '吟味されない生は生きるに値しない。',
  1,
  1,
  'アテナイの裁判でソクラテスが語った言葉。自己省察の重要性を示しています。'
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id) VALUES (
  'To find yourself, think for yourself.',
  '自分自身を見つけるには、自分で考えなければならない。',
  1,
  1
);

-- アインシュタイン
INSERT INTO quotes (text, text_ja, author_id, subcategory_id, background) VALUES (
  'Imagination is more important than knowledge.',
  '想像力は知識よりも重要である。',
  2,
  2,
  'アインシュタインは想像力こそが新しい発見の源泉であると考えていました。'
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id) VALUES (
  'Life is like riding a bicycle. To keep your balance, you must keep moving.',
  '人生は自転車に乗るようなものだ。バランスを保つには、動き続けなければならない。',
  2,
  2
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id) VALUES (
  'The important thing is not to stop questioning.',
  '大切なのは、疑問を持ち続けることである。',
  2,
  2
);

-- ルフィ
INSERT INTO quotes (text, text_ja, author_id, subcategory_id, background) VALUES (
  'I''m gonna be King of the Pirates!',
  '海賊王に、おれはなる！',
  3,
  3,
  'ワンピースの主人公モンキー・D・ルフィの決め台詞。'
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id, background) VALUES (
  'When do you think people die? When they are forgotten.',
  '人はいつ死ぬと思う？人に忘れられた時さ。',
  3,
  3,
  'ドクター・ヒルルクの名言をルフィが引用したもの。'
);

INSERT INTO quotes (text, text_ja, author_id, subcategory_id) VALUES (
  'I don''t wanna conquer anything. I just think the guy with the most freedom in this whole ocean is the Pirate King!',
  'おれは別に何かを征服したいわけじゃねェんだ。この海で一番自由な奴が海賊王だ！',
  3,
  3
);
