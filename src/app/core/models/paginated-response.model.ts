// core/models/paginated-response.model.ts

export interface PaginatedResponse<T> {

    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }