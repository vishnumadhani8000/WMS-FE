import { Routes } from '@angular/router';

import { APP_ROUTES } from './shared/constants/app-routes.constants';

import { AdminLayout } from './core/layouts/admin-layout/admin-layout';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [


    /// ------------------------------- Admin 
    {
        path: APP_ROUTES.ADMIN.ROOT,
        component: AdminLayout,
        canActivate: [authGuard, roleGuard],
        data: {
            role: 'Admin',
        },
        children: [
            {
                path: '',
                redirectTo: APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT,
                pathMatch: 'full',
            },

            {
                path: APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT,
                loadComponent: () =>
                    import('./features/admin/product-management/product-management.js')
                        .then((m) => m.ProductManagement),
            },
            {
                path: APP_ROUTES.ADMIN.VEHICLE_MANAGEMENT,
                loadComponent: () =>
                    import('./features/admin/vehicle-management/vehicle-management.js')
                        .then((m) => m.VehicleManagement),
            },

            {
                path: '**',
                redirectTo: APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT,
            },


        ],
    },


    //----------------------------- Login Route
    
    
    {
        path: APP_ROUTES.AUTH.LOGIN,

        canActivate: [authGuard],

        data: {
            guestOnly: true,
        },
        loadComponent: () =>
            import('./features/auth/components/login/login')
                .then((m) => m.Login),
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