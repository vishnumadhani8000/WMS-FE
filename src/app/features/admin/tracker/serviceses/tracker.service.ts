import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import {
  AdminOrderFilter,
  AdminOrderResponseDto,
  AdminOrderDetailResponseDto,
  StateDto,
  CityDto,
  AvailableDriverDto,
  AvailableVehicleDto,
  MakeShipmentRequest,
} from '../models/tracker.model';

import { ApiResponse } from '../../../../core/models/api-responce.model';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getOrders(filter: AdminOrderFilter): Observable<ApiResponse<PaginatedResponse<AdminOrderResponseDto>>> {
    let params = new HttpParams().set('PageNumber', filter.page).set('PageSize', filter.pageSize);

    if (filter.search) {
      params = params.set('Search', filter.search);
    }

    if (filter.sortBy) {
      params = params.set('SortBy', filter.sortBy);
    }

    if (filter.ascending !== undefined) {
      params = params.set('Ascending', filter.ascending);
    }

    if (filter.stateId != null) {
      params = params.set('StateId', filter.stateId);
    }

    if (filter.cityId != null) {
      params = params.set('CityId', filter.cityId);
    }

    if (filter.isPendingAndAccepted != null) {
      params = params.set('onlypendingandaccepted', filter.isPendingAndAccepted);
    }

    return this.http.get<ApiResponse<PaginatedResponse<AdminOrderResponseDto>>>(
      `${this.baseUrl}/orders`,
      { params }
    );
  }

  getOrderById(id: number): Observable<ApiResponse<AdminOrderDetailResponseDto>> {
    return this.http.get<ApiResponse<AdminOrderDetailResponseDto>>(`${this.baseUrl}/orders/${id}`);
  }

  getStates(): Observable<ApiResponse<StateDto[]>> {
    return this.http.get<ApiResponse<StateDto[]>>(`${this.baseUrl}/State/all`);
  }

  getCitiesByState(stateId: number): Observable<ApiResponse<CityDto[]>> {
    return this.http.get<ApiResponse<CityDto[]>>(`${this.baseUrl}/City/state/${stateId}`);
  }

  getAvailableDrivers(): Observable<ApiResponse<AvailableDriverDto[]>> {
    return this.http.get<ApiResponse<AvailableDriverDto[]>>(`${this.baseUrl}/drivers/available`);
  }

  getAvailableVehicles(
    totalWeightKg: number
  ): Observable<ApiResponse<AvailableVehicleDto[]>> {
    return this.http.get<ApiResponse<AvailableVehicleDto[]>>(
      `${this.baseUrl}/vehicles/available`,
      {
        params: {
          totalWeightKg,
        },
      }
    );
  }

  makeShipment(request: MakeShipmentRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/shipments`, request);
  }
}
