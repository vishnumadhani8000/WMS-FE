import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ShipmentDetail, ShipmentDetailResponse } from '../models/shipment.model';

@Injectable({ providedIn: 'root' })
export class ShipmentDetailService {
  private readonly base = `${environment.baseUrl}/shipments`;

  constructor(private readonly http: HttpClient) {}

  getShipmentDetail(id: number): Observable<ShipmentDetail> {
    return this.http
      .get<ShipmentDetailResponse>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }
}