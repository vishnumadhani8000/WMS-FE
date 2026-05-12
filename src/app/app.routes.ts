import { Routes } from '@angular/router';

import { APP_ROUTES } from './shared/constants/app-routes.constants';

import { AdminLayout } from './core/layouts/admin-layout/admin-layout';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
/// Login 
  {
    path: APP_ROUTES.AUTH.LOGIN,
    loadComponent: () =>
      import('./features/auth/components/login/login')
        .then((m) => m.Login),
  },

/// Admin 
  {
    path: APP_ROUTES.ADMIN.ROOT,
    component: AdminLayout,
    canActivate: [authGuard,roleGuard],
    data: {
      role: 'Admin',
    },
    children: [
      {
        path: '',
        redirectTo: APP_ROUTES.ADMIN.DRIVER_MANAGEMENT,
        pathMatch: 'full',
      },

      {
        path: APP_ROUTES.ADMIN.DRIVER_MANAGEMENT,
        loadComponent: () =>
          import('./features/auth/components/login/login')
            .then((m) => m.Login),
      },

    ],
  },


  {
    path: '',
    redirectTo: APP_ROUTES.AUTH.LOGIN,
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: APP_ROUTES.AUTH.LOGIN,
  },
];