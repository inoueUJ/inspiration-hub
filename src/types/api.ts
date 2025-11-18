/**
 * APIレスポンス型
 */
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  error?: string
}

/**
 * エラーコード型
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"

/**
 * APIエラーレスポンス型
 */
export interface ApiErrorResponse {
  error: string
  message: string
  code: ErrorCode
}

/**
 * ページネーションレスポンス型
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
