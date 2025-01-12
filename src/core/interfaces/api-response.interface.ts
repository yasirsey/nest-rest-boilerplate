// src/core/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  message?: string;
  statusCode: number;
  timestamp: string;
}
