import { NextResponse } from "next/server";

/**
 * 成功レスポンスを生成
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * エラーレスポンスを生成
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status?: number
) {
  const statusCode = status ?? getStatusFromErrorCode(code);

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status: statusCode }
  );
}

/**
 * エラーコード定義
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/**
 * エラーコードからHTTPステータスコードを取得
 */
function getStatusFromErrorCode(code: ErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "NOT_FOUND":
      return 404;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "CONFLICT":
      return 409;
    case "INTERNAL_ERROR":
      return 500;
    default:
      return 500;
  }
}
