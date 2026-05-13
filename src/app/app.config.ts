import {APP_INITIALIZER,ApplicationConfig, inject} from '@angular/core';
import { provideRouter,} from '@angular/router';
import {provideHttpClient, withInterceptors,} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './features/auth/services/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import {provideAnimations} from '@angular/platform-browser/animations';
import { provideToastr} from 'ngx-toastr';

function initializeAuth() {
  const authService = inject(AuthService);
  return () =>
    firstValueFrom(
      authService.refresh(),
    ).catch(() => Promise.resolve());
}

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        authInterceptor,
      ]),
    ),
    provideAnimations(),
    provideToastr({
      closeButton: true,
      progressBar: true,
      timeOut: 2000,
    }),
    {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: initializeAuth,
  },

  ],
};