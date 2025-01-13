// src/core/interfaces/api-response.interface.ts
export interface BaseApiResponse<T> {
  data: T extends void ? null : T;
  message?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
