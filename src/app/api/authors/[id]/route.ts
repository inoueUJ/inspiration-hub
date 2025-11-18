import { NextRequest } from "next/server"
import { z } from "zod"
import {
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} from "@/lib/db/queries/authors"
import { successResponse, errorResponse } from "@/lib/api/response"
import { idParamSchema, updateAuthorSchema } from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

interface RouteContext {
  params: { id: string }
}

/**
 * GET /api/authors/[id]
 * 人物取得
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = idParamSchema.parse(params)
    const author = await getAuthorById(id)

    if (!author) {
      return errorResponse("NOT_FOUND", "人物が見つかりません", 404)
    }

    return successResponse(author)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error fetching author:", error)
    return errorResponse("INTERNAL_ERROR", "人物の取得に失敗しました")
  }
}

/**
 * PATCH /api/authors/[id]
 * 人物更新（管理者のみ）
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth(request)

    const { id } = idParamSchema.parse(params)
    const body = await request.json()
    const validated = updateAuthorSchema.parse(body)

    if (!validated.name) {
      return errorResponse("VALIDATION_ERROR", "更新内容がありません")
    }

    const author = await updateAuthor(id, validated.name)

    if (!author) {
      return errorResponse("NOT_FOUND", "人物が見つかりません", 404)
    }

    return successResponse(author)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error updating author:", error)

    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return errorResponse("CONFLICT", "この人物名は既に存在します")
    }

    return errorResponse("INTERNAL_ERROR", "人物の更新に失敗しました")
  }
}

/**
 * DELETE /api/authors/[id]
 * 人物削除（管理者のみ）
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth(request)

    const { id } = idParamSchema.parse(params)
    const author = await deleteAuthor(id)

    if (!author) {
      return errorResponse("NOT_FOUND", "人物が見つかりません", 404)
    }

    return successResponse({ message: "人物を削除しました" })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error deleting author:", error)
    return errorResponse("INTERNAL_ERROR", "人物の削除に失敗しました")
  }
}
