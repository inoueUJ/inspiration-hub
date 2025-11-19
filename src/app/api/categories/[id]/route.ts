import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { successResponse, errorResponse } from "@/lib/api/response";
import { updateCategorySchema, idParamSchema } from "@/lib/api/validation";
import { requireAuth } from "@/lib/auth/middleware";
import { AppError, NotFoundError } from "@/lib/api/error";

/**
 * PUT /api/categories/[id]
 * カテゴリ更新（管理者のみ）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);

    const { id } = idParamSchema.parse(await params);
    const body = await request.json();
    const validated = updateCategorySchema.parse(body);

    const db = await getDb();
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory || existingCategory.deletedAt) {
      throw new NotFoundError("カテゴリが見つかりません");
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return successResponse(updatedCategory);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode);
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります");
    }

    console.error("Error updating category:", error);

    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return errorResponse("CONFLICT", "このカテゴリ名は既に存在します");
    }

    return errorResponse("INTERNAL_ERROR", "カテゴリの更新に失敗しました");
  }
}

/**
 * DELETE /api/categories/[id]
 * カテゴリ削除（管理者のみ、Soft Delete）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);

    const { id } = idParamSchema.parse(await params);

    const db = await getDb();
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    if (!existingCategory || existingCategory.deletedAt) {
      throw new NotFoundError("カテゴリが見つかりません");
    }

    const [deletedCategory] = await db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return successResponse(deletedCategory);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode);
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります");
    }

    console.error("Error deleting category:", error);
    return errorResponse("INTERNAL_ERROR", "カテゴリの削除に失敗しました");
  }
}
