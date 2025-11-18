import { NextRequest } from "next/server"
import { z } from "zod"
import { getAllAuthors, createAuthor } from "@/lib/db/queries/authors"
import { successResponse, errorResponse } from "@/lib/api/response"
import { createAuthorSchema } from "@/lib/api/validation"
import { requireAuth } from "@/lib/auth/middleware"
import { AppError } from "@/lib/api/error"

/**
 * GET /api/authors
 * 全人物取得
 */
export async function GET() {
  try {
    const authors = await getAllAuthors()

    return successResponse(authors)
  } catch (error) {
    console.error("Error fetching authors:", error)
    return errorResponse("INTERNAL_ERROR", "人物の取得に失敗しました")
  }
}

/**
 * POST /api/authors
 * 人物作成（管理者のみ）
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)

    const body = await request.json()
    const validated = createAuthorSchema.parse(body)

    const author = await createAuthor(validated.name)

    return successResponse(author, 201)
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.statusCode)
    }

    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "入力内容に誤りがあります")
    }

    console.error("Error creating author:", error)

    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return errorResponse("CONFLICT", "この人物名は既に存在します")
    }

    return errorResponse("INTERNAL_ERROR", "人物の作成に失敗しました")
  }
}
