import { NextRequest } from "next/server";
import { z } from "zod";
import { isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createCategorySchema } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/middleware";
import { AppError } from "@/lib/api/error";

/**
 * GET /api/categories
 * 全カテゴリ取得（削除済み除外）
 */
export async function GET() {
  try {
    const db = await getDb();
    const allCategories = await db
      .select()
      .from(categories)
      .where(isNull(categories.deletedAt))
      .orderBy(categories.createdAt);

    return successResponse(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return errorResponse("INTERNAL_ERROR", "カテゴリの取得に失敗しました");
  }
}

/**
 * POST /api/categories
 * カテゴリ作成（管理者のみ）
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const body = await request.json();
    const validated = createCategorySchema.parse(body);

    const db = await getDb();
    const [newCategory] = await db
      .insert(categories)
      .values(validated)
      .returning();

    return successResponse(newCategory, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode);
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります");
    }

    console.error("Error creating category:", error);
    
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return errorResponse("CONFLICT", "このカテゴリ名は既に存在します");
    }

    return errorResponse("INTERNAL_ERROR", "カテゴリの作成に失敗しました");
  }
}
