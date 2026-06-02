import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { City, CityFilter, CityFormValue } from '../models/state-city.model';
import { environment } from '../../../../../environments/environment';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';

@Injectable({ providedIn: 'root' })
export class CityService {
  private readonly base = `${environment.baseUrl}/city`;

  constructor(private http: HttpClient) {}

  getCities(filter: CityFilter): Observable<PaginatedResponse<City>> {
    let params = new HttpParams()
      .set('stateId', filter.stateId.toString())
      .set('pageNumber', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if(filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.ascending !== null && filter.ascending !== undefined) {
      params = params.set('ascending', filter.ascending.toString());
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<City>>>(this.base, { params })
      .pipe(
        map((res) => {
          return res.data;
        })
      );
  }

  createCity(form: CityFormValue): Observable<City> {
    return this.http
      .post<ApiResponse<City>>(this.base, form)
      .pipe(
        map((res) => {
          return res.data;
        })
      );
  }

  updateCity(id: number, name: string): Observable<City> {
    return this.http
      .put<ApiResponse<City>>(`${this.base}/${id}`, {name})
      .pipe(
        map((res) => {
          return res.data;
        })
      );
  }

  deleteCity(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map((): void => undefined));
  }
}