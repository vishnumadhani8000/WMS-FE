import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  finalize,
  Observable,
  tap,
  throwError,
} from 'rxjs';

import {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
} from '../models/auth.models';

import { ApiResponse } from '../../../core/models/api-responce.model';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.baseUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  isInitialized = signal(false);
  private accessToken = signal<string | null>(null);
  isLoggedIn = computed(() => this.accessToken() !== null);
  private userRole = signal<string | null>(null);
  private userName = signal<string | null>(null);

  login(
    payload: LoginRequest,
  ): Observable<ApiResponse<LoginResponse>> {

    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${BASE}/login`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          if (!res.isSuccess || !res.data) return;

          this.accessToken.set(res.data.accessToken);
          this.userRole.set(res.data.role);
          this.userName.set(res.data.name);
        }),

        catchError((err) =>
          throwError(() => err),
        ),
      );
  }

  signUp(
    payload: SignUpRequest,
  ): Observable<ApiResponse<SignUpResponse>> {

    return this.http.post<
      ApiResponse<SignUpResponse>
    >(`${BASE}/signup`, payload);
  }

  refresh(): Observable<ApiResponse<LoginResponse>> {

    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${BASE}/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {

          if (!res.isSuccess || !res.data) return;

          this.accessToken.set(res.data.accessToken);
          this.userRole.set(res.data.role);
          this.userName.set(res.data.name);
        }),

        finalize(() =>
          this.isInitialized.set(true),
        ),

        catchError((err) =>
          throwError(() => err),
        ),
      );
  }

  logout(): Observable<ApiResponse<null>> {

    return this.http
      .post<ApiResponse<null>>(
        `${BASE}/logout`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap(() => {
          this.accessToken.set(null);
          this.userRole.set(null);
          this.userName.set(null);
        }),

        catchError((err) => {
          this.accessToken.set(null);
          this.userRole.set(null);
          this.userName.set(null);

          return throwError(() => err);
        }),
      );
  }
  getAccessToken(): string | null {
    return this.accessToken();
  }
  getUserRole(): string | null {
    return this.userRole();
  }
  getUserName(): string | null {
    return this.userName();
  }
  isAdmin(): boolean {
    return this.userRole() === 'Admin';
  }
  isCustomer(): boolean {
    return this.userRole() === 'Customer';
  }
}