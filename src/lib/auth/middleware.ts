import { NextRequest } from "next/server";
import { checkSession } from "./session";
import { UnauthorizedError } from "@/lib/api/error";
import type { Session } from "@/lib/db/schema";

/**
 * 認証必須チェック
 * 未認証の場合は UnauthorizedError をスロー
 */
export async function requireAuth(request: NextRequest): Promise<Session> {
  const session = await checkSession();

  if (!session) {
    throw new UnauthorizedError("ログインが必要です");
  }

  return session;
}

/**
 * 認証チェック（エラーをスローしない版）
 */
export async function optionalAuth(): Promise<Session | null> {
  return await checkSession();
}
