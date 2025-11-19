import { NextRequest } from "next/server"
import { z } from "zod"
import {
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/db/queries/subcategories"
import { successResponse, errorResponse } from "@/lib/api/response"
import {
  idParamSchema,
  updateSubcategorySchema,
} from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/subcategories/[id]
 * 中項目取得
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params
    const { id } = idParamSchema.parse(params)
    const subcategory = await getSubcategoryById(id)

    if (!subcategory) {
      return errorResponse("NOT_FOUND", "中項目が見つかりません", 404)
    }

    return successResponse(subcategory)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error fetching subcategory:", error)
    return errorResponse("INTERNAL_ERROR", "中項目の取得に失敗しました")
  }
}

/**
 * PATCH /api/subcategories/[id]
 * 中項目更新（管理者のみ）
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAuth(request)

    const params = await context.params
    const { id } = idParamSchema.parse(params)
    const body = await request.json()
    const validated = updateSubcategorySchema.parse(body)

    const subcategory = await updateSubcategory(id, validated)

    if (!subcategory) {
      return errorResponse("NOT_FOUND", "中項目が見つかりません", 404)
    }

    return successResponse(subcategory)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error updating subcategory:", error)
    return errorResponse("INTERNAL_ERROR", "中項目の更新に失敗しました")
  }
}

/**
 * DELETE /api/subcategories/[id]
 * 中項目削除（管理者のみ）
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await requireAuth(request)

    const params = await context.params
    const { id } = idParamSchema.parse(params)
    const subcategory = await deleteSubcategory(id)

    if (!subcategory) {
      return errorResponse("NOT_FOUND", "中項目が見つかりません", 404)
    }

    return successResponse({ message: "中項目を削除しました" })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error deleting subcategory:", error)
    return errorResponse("INTERNAL_ERROR", "中項目の削除に失敗しました")
  }
}
