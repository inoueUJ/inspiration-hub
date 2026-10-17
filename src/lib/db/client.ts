import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

/**
 * Drizzle ORM DB インスタンス
 * 環境に応じて接続方法を自動切り替え：
 * - 開発環境（NODE_ENV !== "production"）: better-sqlite3（./local.db）
 * - 本番環境（NODE_ENV === "production"）: Cloudflare D1（バインディング：DB）
 *
 * D1（async）と better-sqlite3（sync）の共通基底型で扱う。
 * `any` にしていると `.where().where()` のような「後勝ちで条件が消える」誤用を
 * 型チェックで検出できないため、必ずこの型を経由させる。
 */
export type Database = BaseSQLiteDatabase<
  "sync" | "async",
  unknown,
  typeof schema
>;

let dbInstance: Database | null = null;

/**
 * Cloudflareコンテキストを取得
 * 本番環境でのみ利用可能
 */
async function getCloudflareContext() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return getCloudflareContext({ async: true });
  } catch {
    return null;
  }
}

export async function getDb(): Promise<Database> {
  // 既存インスタンスがあれば再利用
  if (dbInstance) {
    return dbInstance;
  }

  if (process.env.NODE_ENV === "production") {
    // 本番環境：Cloudflare D1
    const context = await getCloudflareContext();
    if (!context?.env?.DB) {
      throw new Error(
        "D1 database binding (DB) not found in production environment. " +
          "Please ensure d1_databases binding is configured in wrangler.jsonc"
      );
    }
    dbInstance = drizzleD1(context.env.DB, { schema });
  } else {
    // 開発環境：better-sqlite3
    try {
      // ネイティブモジュールのため、本番（Workers）バンドルに静的 import で含めない
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require("better-sqlite3");
      const dbPath = (process.env.DATABASE_URL || "./local.db").replace(
        /^file:/,
        ""
      );
      const sqliteDb = new Database(dbPath);

      // WAL（Write-Ahead Logging）モードを有効化（パフォーマンス向上）
      sqliteDb.pragma("journal_mode = WAL");

      dbInstance = drizzleSqlite(sqliteDb, { schema });
    } catch (error) {
      throw new Error(
        `Failed to initialize local SQLite database: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return dbInstance;
}
