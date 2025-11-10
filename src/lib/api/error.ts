import type { ErrorCode } from "./response";

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
    this.name = "ValidationError";
  }
}

/**
 * 未認証エラー
 */
export class UnauthorizedError extends AppError {
  constructor(message = "認証が必要です") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * リソース未検出エラー
 */
export class NotFoundError extends AppError {
  constructor(message = "リソースが見つかりません") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * 競合エラー
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}
