export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  totalPages: number;
}