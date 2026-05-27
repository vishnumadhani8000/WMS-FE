import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../features/auth/services/auth.service';
import { ToastRef, ToastrService } from 'ngx-toastr';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const toastr = inject(ToastrService);

  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {

        case 400:
          toastr.error(
            error.error?.message || 'Bad Request'
          );
          break;

        case 401:
          toastr.error(
            error.error?.message || 'Unauthorized'
          );

          authService.logout();
          break;

        case 403:
          toastr.error(
            error.error?.message || 'Access Denied'
          );
          break;

        case 404:
          toastr.error(
            error.error?.message || 'Resource Not Found'
          );
          break;

        case 500:
          toastr.error(
            error.error?.message || 'Internal Server Error'
          );
          break;

        default:
          toastr.error(
            error.error?.message || 'Something went wrong'
          );
          break;
      }

      return throwError(() => error);
    })
  );
};