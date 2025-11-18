import { NextRequest } from "next/server"
import { z } from "zod"
import {
  getAllSubcategories,
  createSubcategory,
} from "@/lib/db/queries/subcategories"
import { successResponse, errorResponse } from "@/lib/api/response"
import { createSubcategorySchema } from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

/**
 * GET /api/subcategories
 * 全中項目取得
 */
export async function GET() {
  try {
    const subcategories = await getAllSubcategories()

    return successResponse(subcategories)
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return errorResponse("INTERNAL_ERROR", "中項目の取得に失敗しました")
  }
}

/**
 * POST /api/subcategories
 * 中項目作成（管理者のみ）
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)

    const body = await request.json()
    const validated = createSubcategorySchema.parse(body)

    const subcategory = await createSubcategory(
      validated.categoryId,
      validated.name
    )

    return successResponse(subcategory, 201)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error creating subcategory:", error)
    return errorResponse("INTERNAL_ERROR", "中項目の作成に失敗しました")
  }
}
