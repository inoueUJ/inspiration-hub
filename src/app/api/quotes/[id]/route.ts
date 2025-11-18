import { NextRequest } from "next/server"
import { z } from "zod"
import {
  getQuoteById,
  updateQuote,
  deleteQuote,
} from "@/lib/db/queries/quotes"
import { successResponse, errorResponse } from "@/lib/api/response"
import { idParamSchema, updateQuoteSchema } from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

interface RouteContext {
  params: { id: string }
}

/**
 * GET /api/quotes/[id]
 * 名言取得
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = idParamSchema.parse(params)
    const quote = await getQuoteById(id)

    if (!quote) {
      return errorResponse("NOT_FOUND", "名言が見つかりません", 404)
    }

    return successResponse(quote)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error fetching quote:", error)
    return errorResponse("INTERNAL_ERROR", "名言の取得に失敗しました")
  }
}

/**
 * PATCH /api/quotes/[id]
 * 名言更新（管理者のみ）
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth(request)

    const { id } = idParamSchema.parse(params)
    const body = await request.json()
    const validated = updateQuoteSchema.parse(body)

    const quote = await updateQuote(id, validated)

    if (!quote) {
      return errorResponse("NOT_FOUND", "名言が見つかりません", 404)
    }

    return successResponse(quote)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error updating quote:", error)
    return errorResponse("INTERNAL_ERROR", "名言の更新に失敗しました")
  }
}

/**
 * DELETE /api/quotes/[id]
 * 名言削除（管理者のみ）
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth(request)

    const { id } = idParamSchema.parse(params)
    const quote = await deleteQuote(id)

    if (!quote) {
      return errorResponse("NOT_FOUND", "名言が見つかりません", 404)
    }

    return successResponse({ message: "名言を削除しました" })
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "不正なIDです")
    }

    console.error("Error deleting quote:", error)
    return errorResponse("INTERNAL_ERROR", "名言の削除に失敗しました")
  }
}
