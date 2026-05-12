import { Routes } from '@angular/router';
import { APP_ROUTES } from './shared/constants/app-routes.constants';
import { AdminLayout } from './core/layouts/admin-layout/admin-layout';

export const routes: Routes = [


    {
        path: '',
        component: AdminLayout
      },
    

    {
        path: APP_ROUTES.AUTH.LOGIN,
        loadComponent: () =>
            import('./features/auth/components/login/login').then((m) => m.Login),
    },


];
