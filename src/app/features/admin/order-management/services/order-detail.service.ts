import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderDetail } from '../models/order-detail.model';
import { environment } from '../../../../../environments/environment';


interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
  errors: null | string[];
}

@Injectable({ providedIn: 'root' })

export class OrderDetailService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/orders`;

  getOrderDetail(orderId: number): Observable<OrderDetail> {
    return this.http
      .get<ApiResponse<OrderDetail>>(`${this.baseUrl}/${orderId}`)
      .pipe(map((res) => res.data));
  }
}