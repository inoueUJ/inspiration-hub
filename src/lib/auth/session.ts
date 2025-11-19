import { cookies } from "next/headers";
import { getDb } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Session } from "@/lib/db/schema";

const COOKIE_NAME = "session_token";
const SESSION_DURATION_DAYS = 7;

/**
 * セッションを作成
 */
export async function createSession(): Promise<{
  token: string;
  session: Session;
}> {
  const db = await getDb();
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const [session] = await db
    .insert(sessions)
    .values({
      token,
      expiresAt,
    })
    .returning();

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return { token, session };
}

/**
 * セッションを検証
 */
export async function checkSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const db = await getDb();
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await deleteSession(token);
    return null;
  }

  return session;
}

/**
 * セッションを削除
 */
export async function deleteSession(token?: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = token || cookieStore.get(COOKIE_NAME)?.value;

  if (sessionToken) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.token, sessionToken));
  }

  cookieStore.delete(COOKIE_NAME);
}
