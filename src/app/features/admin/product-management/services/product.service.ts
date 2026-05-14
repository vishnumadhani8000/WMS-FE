// product.service.ts

import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import {
  Product,
  ProductFilter,
  ProductFormValue,
} from '../models/product.model';

import { environment } from '../../../../../environments/environment';

import { PaginatedResponse } from '../../../../core/models/paginated-response.model';

import { ApiResponse } from '../../../../core/models/api-responce.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private readonly base =
    `${environment.baseUrl}/products`;

  constructor(
    private http: HttpClient
  ) {}

  // ─────────────────────────────────────────────
  // Get Products
  // ─────────────────────────────────────────────

  getProducts(
    filter: ProductFilter
  ): Observable<PaginatedResponse<Product>> {

    let params = new HttpParams()

      .set(
        'pageNumber',
        filter.page.toString()
      )

      .set(
        'pageSize',
        filter.pageSize.toString()
      );

    // Search

    if (filter.search?.trim()) {

      params = params.set(
        'search',
        filter.search.trim()
      );
    }

    // Sorting

    if (filter.sortBy) {

      params = params.set(
        'sortBy',
        filter.sortBy
      );
    }

    if (filter.ascending !== null &&
      filter.ascending !== undefined) {
  
    params = params.set(
      'ascending',
      filter.ascending.toString()
    );
  }

    return this.http
      .get<
        ApiResponse<
          PaginatedResponse<Product>
        >
      >(
        this.base,
        { params }
      )

      .pipe(

        map((res) => {

          if (!res.data) {

            throw new Error(
              'Failed to load products'
            );
          }

          return res.data;
        })
      );
  }

  // ─────────────────────────────────────────────
  // Create Product
  // ─────────────────────────────────────────────

  createProduct(
    form: ProductFormValue
  ): Observable<Product> {

    return this.http
      .post<ApiResponse<Product>>(
        this.base,
        form
      )

      .pipe(

        map((res) => {

          if (!res.data) {

            throw new Error(
              'Failed to create product'
            );
          }

          return res.data;
        })
      );
  }

  // ─────────────────────────────────────────────
  // Update Product
  // ─────────────────────────────────────────────

  updateProduct(
    id: number,
    form: ProductFormValue
  ): Observable<Product> {

    return this.http
      .put<ApiResponse<Product>>(
        `${this.base}/${id}`,
        form
      )

      .pipe(

        map((res) => {

          if (!res.data) {

            throw new Error(
              'Failed to update product'
            );
          }

          return res.data;
        })
      );
  }

  // ─────────────────────────────────────────────
  // Delete Product
  // ─────────────────────────────────────────────

  deleteProduct(
    id: number
  ): Observable<void> {

    return this.http
      .delete<ApiResponse<void>>(
        `${this.base}/${id}`
      )

      .pipe(
        map(() => undefined)
      );
  }

  // ─────────────────────────────────────────────
  // Get Product By Id
  // ─────────────────────────────────────────────

  getProductById(
    id: number
  ): Observable<Product> {

    return this.http
      .get<ApiResponse<Product>>(
        `${this.base}/${id}`
      )

      .pipe(

        map((res) => {

          if (!res.data) {

            throw new Error(
              'Product not found'
            );
          }

          return res.data;
        })
      );
  }
}