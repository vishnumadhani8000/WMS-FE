import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderFilter, OrderStatus, PagedResult } from '../models/order-management.model';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-responce.model';



@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/orders`;

  getOrders(filter: OrderFilter): Observable<PagedResult<Order>> {
    let params = new HttpParams()
      .set('pageNumber', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search)               params = params.set('search', filter.search);
    if (filter.sortBy)               params = params.set('sortBy', filter.sortBy);
    if (filter.ascending !== undefined) params = params.set('ascending', filter.ascending.toString());
    if (filter.onlyPending !== undefined) params = params.set('onlyPending', filter.onlyPending.toString());

    return this.http
      .get<ApiResponse<PagedResult<Order>>>(`${this.baseUrl}`, { params })
      .pipe(map((res) => res.data));
  }
  updateOrderStatus(orderId: number, status: OrderStatus, notes = ''): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${orderId}`, {
      status,
      notes,
    });
  } 
  acceptOrder(orderId: number): Observable<void> {
    return this.updateOrderStatus(orderId, 'Accepted');
  }
  
  completeOrder(orderId: number): Observable<void> {
    return this.updateOrderStatus(orderId, 'Delivered');
  }
  
  cancelOrder(orderId: number): Observable<void> {
    return this.updateOrderStatus(orderId, 'Cancelled');
  }
}