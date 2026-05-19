// features/products/services/product.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/products/customer`;
;

getAll(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  return this.http.get<ApiResponse<PaginatedResponse<Product>>>(
    this.baseUrl,
    {
      params: {
        pageNumber: params.page,
        pageSize: params.pageSize,
        search: params.search ?? '',
      },
    }
  );
}
}