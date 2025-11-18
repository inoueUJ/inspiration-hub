import { NextRequest } from "next/server"
import { z } from "zod"
import { getAllQuotes, createQuote } from "@/lib/db/queries/quotes"
import { successResponse, errorResponse } from "@/lib/api/response"
import { createQuoteSchema } from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

/**
 * GET /api/quotes
 * 全名言取得
 */
export async function GET() {
  try {
    const quotes = await getAllQuotes()

    return successResponse(quotes)
  } catch (error) {
    console.error("Error fetching quotes:", error)
    return errorResponse("INTERNAL_ERROR", "名言の取得に失敗しました")
  }
}

/**
 * POST /api/quotes
 * 名言作成（管理者のみ）
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)

    const body = await request.json()
    const validated = createQuoteSchema.parse(body)

    const quote = await createQuote(validated)

    return successResponse(quote, 201)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error creating quote:", error)
    return errorResponse("INTERNAL_ERROR", "名言の作成に失敗しました")
  }
}
