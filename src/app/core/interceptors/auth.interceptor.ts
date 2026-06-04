  import {
    HttpErrorResponse,
    HttpInterceptorFn
  } from '@angular/common/http';

  import { inject } from '@angular/core';
  import { catchError, finalize, throwError } from 'rxjs';

  import { AuthService } from '../../features/auth/services/auth.service';
  import { LoadingService } from '../services/loading.service';
  import { ToastrService } from 'ngx-toastr';

  export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const loadingService = inject(LoadingService);
    const toastr = inject(ToastrService);

    loadingService.show();

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
            toastr.error(error.error?.Message || 'Bad Request');
            break;

          case 401:
            toastr.error(error.error?.Message || 'Unauthorized');
            authService.logout();
            break;

          case 403:
            toastr.error(error.error?.Message || 'Access Denied');
            break;

          case 404:
            toastr.error(error.error?.Message || 'Resource Not Found');
            break;

          case 500:
            toastr.error(error.error?.Message || 'Internal Server Error');
            break;

          default:
            toastr.error(error.error?.Message || 'Something went wrong');
            break;
        }

        return throwError(() => error);
      }),
      finalize(() => {
        loadingService.hide();
      })
    );
  };