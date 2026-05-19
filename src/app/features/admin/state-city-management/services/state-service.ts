import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { State, StateFilter, StateFormValue } from '../models/state-city.model';
import { environment } from '../../../../../environments/environment';
import { PaginatedResponse } from '../../../../core/models/paginated-response.model';
import { ApiResponse } from '../../../../core/models/api-responce.model';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly base = `${environment.baseUrl}/state`;

  constructor(private http: HttpClient) {}

  getStates(filter: StateFilter): Observable<PaginatedResponse<State>> {
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
      .get<ApiResponse<PaginatedResponse<State>>>(this.base, { params })
      .pipe(
        map((res) => {
          if (!res.data) throw new Error('Failed to load states');
          return res.data;
        })
      );
  }

  createState(form: StateFormValue): Observable<State> {
    return this.http
      .post<ApiResponse<State>>(this.base, form)
      .pipe(
        map((res) => {
          if (!res.data) throw new Error('Failed to create state');
          return res.data;
        })
      );
  }

  updateState(id: number, form: StateFormValue): Observable<State> {
    return this.http
      .put<ApiResponse<State>>(`${this.base}/${id}`, form)
      .pipe(
        map((res) => {
          if (!res.data) throw new Error('Failed to update state');
          return res.data;
        })
      );
  }

  deleteState(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map((): void => undefined));
  }
}