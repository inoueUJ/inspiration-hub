import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/api/response";
import { loginSchema } from "@/lib/api/validation";
import { createSession, deleteSession } from "@/lib/auth/session";

/**
 * POST /api/admin/login
 * 管理者ログイン
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = loginSchema.parse(body);

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD is not set");
      return errorResponse("INTERNAL_ERROR", "システムエラーが発生しました");
    }

    if (password !== adminPassword) {
      return errorResponse("UNAUTHORIZED", "パスワードが正しくありません");
    }

    const { session } = await createSession();

    return successResponse({
      message: "ログインしました",
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        "入力内容に誤りがあります"
      );
    }

    console.error("Login error:", error);
    return errorResponse("INTERNAL_ERROR", "ログインに失敗しました");
  }
}

/**
 * DELETE /api/admin/login
 * ログアウト
 */
export async function DELETE() {
  try {
    await deleteSession();
    return successResponse({ message: "ログアウトしました" });
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("INTERNAL_ERROR", "ログアウトに失敗しました");
  }
}
