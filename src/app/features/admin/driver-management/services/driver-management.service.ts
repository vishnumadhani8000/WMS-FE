import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Driver, DriverFilter, DriverFormValue } from '../models/driver-management.model';
import { environment } from '../../../../../environments/environment';


export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/drivers`;

  getDrivers(filter: DriverFilter): Observable<PagedResult<Driver>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search) {
      params = params.set('search', filter.search);
    }
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.ascending !== undefined) {
      params = params.set('ascending', filter.ascending.toString());
    }

    return this.http
      .get<ApiResponse<PagedResult<Driver>>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getDriverById(id: number): Observable<Driver> {
    return this.http
      .get<ApiResponse<Driver>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createDriver(dto: DriverFormValue): Observable<Driver> {
    return this.http
      .post<ApiResponse<Driver>>(this.baseUrl, dto)
      .pipe(map((res) => res.data));
  }

  updateDriver(id: number, dto: DriverFormValue): Observable<Driver> {
    return this.http
      .put<ApiResponse<Driver>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.data));
  }

  deleteDriver(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map((): void => undefined));

  }
}