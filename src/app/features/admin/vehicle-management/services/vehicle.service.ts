// vehicle.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle, VehicleFilter, VehicleFormValue } from '../models/vehicle.model';
import { environment } from '../../../../../environments/environment';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly base = `${environment.baseUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getVehicles(filter: VehicleFilter): Observable<PaginatedResponse<Vehicle>> {
    let params = new HttpParams()

      .set('pageNumber', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }

    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }

    if (filter.ascending !== null && filter.ascending !== undefined) {
      params = params.set('ascending', filter.ascending.toString());
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<Vehicle>>>(this.base, { params })

      .pipe(
        map((res) => {
          if (!res.data) {
            throw new Error('Failed to load vehicles');
          }

          return res.data;
        })
      );
  }

  createVehicle(form: VehicleFormValue): Observable<Vehicle> {
    return this.http
      .post<ApiResponse<Vehicle>>(this.base, form)

      .pipe(
        map((res) => {
          if (!res.data) {
            throw new Error('Failed to create vehicle');
          }

          return res.data;
        })
      );
  }

  updateVehicle(id: number, form: VehicleFormValue): Observable<Vehicle> {
    return this.http
      .put<ApiResponse<Vehicle>>(`${this.base}/${id}`, form)

      .pipe(
        map((res) => {
          if (!res.data) {
            throw new Error('Failed to update vehicle');
          }

          return res.data;
        })
      );
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)

      .pipe(map((): void => undefined));
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http
      .get<ApiResponse<Vehicle>>(`${this.base}/${id}`)

      .pipe(
        map((res) => {
          if (!res.data) {
            throw new Error('Vehicle not found');
          }

          return res.data;
        })
      );
  }
}
