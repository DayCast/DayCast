// types/api.ts
/**
 * API レスポンスの型定義
 */

// 成功レスポンス
export type ApiResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};

// エラーレスポンス
export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
};

// ページネーション情報
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// ページネーション付きレスポンス
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  pagination: Pagination;
}>;