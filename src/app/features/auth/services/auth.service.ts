import { HttpClient } from '@angular/common/http';
import {computed,inject,  Injectable,signal,} from '@angular/core';
import {catchError,finalize,Observable,tap,throwError} from 'rxjs';
import {LoginRequest,LoginResponse,SignUpRequest,SignUpResponse} from '../models/auth.models';
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
  private userRole = signal<string | null>(null);
  private userName = signal<string | null>(null);
  isLoggedIn = computed(() => !!this.accessToken());

  private setSession( data: LoginResponse,): void {
    this.accessToken.set(data.accessToken);
    this.userRole.set(data.role);
    this.userName.set(data.name);
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.userRole.set(null);
    this.userName.set(null);
  }


  login(
    payload: LoginRequest,
  ): Observable<ApiResponse<LoginResponse>> {

    return this.http
      .post<ApiResponse<LoginResponse>>(
        `${BASE}/login`,
        payload,
        {
          withCredentials: true,
        },
      )
      .pipe(tap((res) => {
          if (!res.isSuccess || !res.data) {
            return;
          }
          this.setSession(res.data);
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
    >(
      `${BASE}/signup`,
      payload,
    );
  }


  refresh(): Observable<ApiResponse<LoginResponse>> {

    return this.http
      .post<ApiResponse<LoginResponse>>(`${BASE}/refresh`,{},{
          withCredentials: true,
        },
      )
      .pipe(tap((res) => {
          if (!res.isSuccess || !res.data) {
            return;
          }
          this.setSession(res.data);
        }),

        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),

        finalize(() =>
          this.isInitialized.set(true),
        ),
      );
  }



  logout(): Observable<ApiResponse<null>> {

    return this.http
      .post<ApiResponse<null>>(`${BASE}/logout`,{},{
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError((err) => {
          this.clearSession();
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