import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
} from '@angular/router';

import { AuthService } from '../../features/auth/services/auth.service';

import { APP_ROUTES } from '../../shared/constants/app-routes.constants';

export const authGuard: CanActivateFn = ( route: ActivatedRouteSnapshot,) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const guestOnly = route.data['guestOnly'];

  const role = authService.getUserRole();

  if (guestOnly) {

    if (authService.isLoggedIn()) {
      return router.createUrlTree([
        role === 'Admin'
          ? `/${APP_ROUTES.ADMIN.ROOT}/${APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT}`
          : `/${APP_ROUTES.CUSTOMER.ROOT}/${APP_ROUTES.CUSTOMER.PRODUCT}`,
      ]);
    }

    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree([`/${APP_ROUTES.AUTH.LOGIN}`]);
};