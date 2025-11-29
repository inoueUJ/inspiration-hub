import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * 大カテゴリテーブル
 * 例：偉人、アニメ、映画
 */
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex("categories_name_idx").on(table.name),
    };
  }
);

/**
 * 中項目テーブル
 * 例：哲学者、数学者（偉人カテゴリ配下）
 */
export const subcategories = sqliteTable("subcategories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

/**
 * 人物テーブル
 * 例：アリストテレス、ソクラテス
 */
export const authors = sqliteTable(
  "authors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => {
    return {
      nameIdx: uniqueIndex("authors_name_idx").on(table.name),
    };
  }
);

/**
 * 名言テーブル
 * 複数言語（原文と日本語翻訳）をサポート
 */
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(), // 原文（英語など）
  textJa: text("text_ja"), // 日本語翻訳（任意）
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "cascade" }),
  subcategoryId: integer("subcategory_id")
    .notNull()
    .references(() => subcategories.id, { onDelete: "cascade" }),
  background: text("background"), // 名言の背景や説明（任意）
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

/**
 * 日替わり名言テーブル
 * 毎日0時（UTC）にバッチ処理でランダム30件を選定
 * 1日あたり30件のレコードが保存される
 */
export const dailyQuotes = sqliteTable(
  "daily_quotes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(), // YYYY-MM-DD 形式（UNIQUE制約削除）
    quoteId: integer("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
  },
  (table) => {
    return {
      // 複合UNIQUE制約: 同じ日に同じ名言は1回のみ
      dateQuoteIdx: uniqueIndex("daily_quotes_date_quote_idx").on(
        table.date,
        table.quoteId
      ),
    };
  }
);

/**
 * 管理画面用セッションテーブル
 * Cookie ベースの認証用
 */
export const sessions = sqliteTable(
  "sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
  },
  (table) => {
    return {
      tokenIdx: uniqueIndex("sessions_token_idx").on(table.token),
    };
  }
);

/**
 * Drizzle Relations
 * テーブル間の関連付けを明示的に定義
 */
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

export type DailyQuote = typeof dailyQuotes.$inferSelect;
export type NewDailyQuote = typeof dailyQuotes.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

/**
 * 著者画像テーブル
 * 1人の著者に複数枚の画像を紐付け（Cloudflare R2）
 */
export const authorImages = sqliteTable("author_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(), // Cloudflare R2 URL
  imageType: text("image_type").notNull(), // "profile", "icon", "background"
  isPrimary: integer("is_primary", { mode: "boolean" })
    .default(false)
    .notNull(),
  altText: text("alt_text"), // アクセシビリティ用
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

/**
 * 名言投稿テーブル（ユーザー投稿、管理者承認待ち）
 * 匿名投稿可能、スパム対策としてIPアドレス記録
 */
export const quoteSubmissions = sqliteTable("quote_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // 投稿内容
  text: text("text").notNull(),
  textJa: text("text_ja"),
  authorName: text("author_name").notNull(), // 既存著者名 or 新規著者名
  categoryName: text("category_name"),
  subcategoryName: text("subcategory_name"),
  background: text("background"),

  // 投稿者情報（任意）
  submitterEmail: text("submitter_email"),
  submitterName: text("submitter_name"),
  submitterIp: text("submitter_ip").notNull(), // スパム対策

  // 審査ステータス
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "editing"

  // 管理者による編集
  editedText: text("edited_text"),
  editedTextJa: text("edited_text_ja"),
  editedAuthorName: text("edited_author_name"),
  editedCategoryName: text("edited_category_name"),
  editedSubcategoryName: text("edited_subcategory_name"),
  editedBackground: text("edited_background"),
  adminFeedback: text("admin_feedback"), // 添削コメント・却下理由

  // 承認情報
  reviewedBy: text("reviewed_by"), // 管理者名
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),

  // 承認後のリンク（承認されたら実際のquoteIdが設定される）
  approvedQuoteId: integer("approved_quote_id").references(() => quotes.id, {
    onDelete: "set null",
  }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

/**
 * ユーザーテーブル（AI推薦機能用）
 * 匿名ユーザーにもIDを割り当て（Cookie/LocalStorageベース）
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(), // UUID（匿名識別用）
  email: text("email").unique(), // 任意（登録ユーザー用）
  preferences: text("preferences"), // JSON: カテゴリ嗜好、好きな著者など
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

/**
 * ユーザーと名言の相互作用テーブル（AI推薦用）
 * いいね、閲覧、シェアなどの履歴を記録
 */
export const userQuoteInteractions = sqliteTable("user_quote_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quoteId: integer("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(), // "like", "view", "share", "favorite"
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch('now'))`)
    .notNull(),
});

export type AuthorImage = typeof authorImages.$inferSelect;
export type NewAuthorImage = typeof authorImages.$inferInsert;

export type QuoteSubmission = typeof quoteSubmissions.$inferSelect;
export type NewQuoteSubmission = typeof quoteSubmissions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserQuoteInteraction = typeof userQuoteInteractions.$inferSelect;
export type NewUserQuoteInteraction = typeof userQuoteInteractions.$inferInsert;
