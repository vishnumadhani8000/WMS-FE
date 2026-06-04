import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ShipmentListResponse,
  ShipmentListResult,
  ShipmentQueryParams,
  ShipmentStatus,
} from '../models/shipment.model';



@Injectable({ providedIn: 'root' })
export class ShipmentService {
  private readonly base = `${environment.baseUrl}/shipments`;

  constructor(private readonly http: HttpClient) {}

  getShipments(query: ShipmentQueryParams): Observable<ShipmentListResult> {
    let params = new HttpParams();

    if (query.page != null)
      params = params.set('pageNumber', query.page);

    if (query.pageSize != null)
      params = params.set('pageSize', query.pageSize);

    if (query.search)
      params = params.set('search', query.search);

    if (query.sortBy)
      params = params.set('sortBy', query.sortBy);

    if (query.ascending != null)
      params = params.set('ascending', query.ascending);

    return this.http
      .get<ShipmentListResponse>(this.base, { params })
      .pipe(
        map((res) => ({
          items: res.data.items,
          totalCount: res.data.totalCount,
        }))
      );
  }

  updateShipmentStatus(
    shipmentId: number,
    status: ShipmentStatus
  ): Observable<void> {
    return this.http.put<void>(
      `${this.base}/${shipmentId}/status`,
      { status }
    );
  }
}