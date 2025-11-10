import type { Config } from "drizzle-kit";

const isProduction = process.env.NODE_ENV === "production";

// 本番環境：d1-http、開発環境：ローカルファイルベース（driver 省略）
const config = isProduction
  ? ({
      schema: "./src/lib/db/schema.ts",
      out: "./src/lib/db/migrations",
      dialect: "sqlite",
      driver: "d1-http",
      dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_API_TOKEN!,
      },
    } as Config)
  : ({
      schema: "./src/lib/db/schema.ts",
      out: "./src/lib/db/migrations",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.DATABASE_URL || "file:./local.db",
      },
    } as Config);

export default config;
