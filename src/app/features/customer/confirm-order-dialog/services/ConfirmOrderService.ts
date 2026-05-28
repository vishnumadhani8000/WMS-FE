import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment'
import { PlaceOrderPayload } from '../models/confirmOrder.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmOrderService {
  private http = inject(HttpClient);

  private readonly apiBase = `${environment.baseUrl}/orders`;

  placeOrder(payload: PlaceOrderPayload): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiBase, payload);
  }

  getOrderById(orderId: string): Observable<ApiResponse<{ orderId: string }>> {
    return this.http.get<ApiResponse<{ orderId: string }>>(`${this.apiBase}/${orderId}`);
  }
}