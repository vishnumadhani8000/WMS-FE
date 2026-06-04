import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-responce.model';
import { AddressData } from '../models/addresh.model';
import { AddAddressDialogData } from '../models/addAddressDialogData.model';


export interface StateOption {
  label: string;
  value: number;
}

export interface CityOption {
  label: string;
  value: number;
}

interface StateResponse {
  id: number;
  name: string;
}

interface CityResponse {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private http = inject(HttpClient);

  private readonly BASE_URL = environment.baseUrl;

  getStates(): Observable<StateOption[]> {
    return this.http
      .get<{ data: StateResponse[] }>(
        `${this.BASE_URL}/State/all`
      )
      .pipe(
        map((res) =>
          res.data.map((state) => ({
            label: state.name,
            value: state.id,
          }))
        )
      );
  }

  getCitiesByState(stateId: number): Observable<CityOption[]> {
    return this.http
      .get<{ data: CityResponse[] }>(
        `${this.BASE_URL}/city/state/${stateId}`
      )
      .pipe(
        map((res) =>
          res.data.map((city) => ({
            label: city.name,
            value: city.id,
          }))
        )
      );
  }
  createAddress(body: AddAddressDialogData) {
    return this.http.post<ApiResponse<AddressData>>(
      `${environment.baseUrl}/user-addresses`,
      body
    );
  }
  deleteAddress(addressId: number) {
    return this.http.delete<ApiResponse<boolean>>(
      `${environment.baseUrl}/user-addresses/${addressId}`
    );
  }
}