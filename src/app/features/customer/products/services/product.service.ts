import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AddToCartDto, Product } from '../models/product.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    ascending?: boolean;
  }) {
    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(
      `${this.baseUrl}/products/customer`,
      {
        params: {
          pageNumber: params.page,
          pageSize: params.pageSize,
          search: params.search ?? '',
          sortBy: params.sortBy ?? '',
          ascending: params.ascending ?? false,
        },
      }
    );
  }
  addToCart(dto: AddToCartDto): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(`${this.baseUrl}/Cart/add`, dto);
  }
}
