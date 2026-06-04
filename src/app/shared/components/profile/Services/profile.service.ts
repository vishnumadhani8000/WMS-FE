import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../Models/profile.model';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/models/api-responce.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/auth`;

  getProfile() {
    return this.http
      .get<ApiResponse<UserProfile>>(
        `${this.baseUrl}/profile`
      )
      .pipe(
        map((response) => response.data)
      );
  }

  updateProfile(request: UpdateProfileRequest) {
    return this.http.put<void>(
      `${this.baseUrl}/profile`,
      request
    );
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.put<void>(
      `${this.baseUrl}/change-password`,
      request
    );
  }
}