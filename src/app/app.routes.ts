import { Routes } from '@angular/router';

import { APP_ROUTES } from './shared/constants/app-routes.constants';

import { AdminLayout } from './core/layouts/admin-layout/admin-layout';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { CustomerLayout } from './core/layouts/customer-layout/customer-layout';

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
                path: APP_ROUTES.ADMIN.DESTINATION_MANAGEMENT,
                loadComponent: () =>
                    import('./features/admin/destination-management/destination-management.js')
                        .then((m) => m.DestinationManagement),

            },

            {
                path: '**',
                redirectTo: APP_ROUTES.ADMIN.PRODUCT_MANAGEMENT,
            },


        ],
    },

    {
        path: APP_ROUTES.CUSTOMER.ROOT,
        component: CustomerLayout,
        canActivate: [authGuard, roleGuard],
        data: {
            role: 'Customer',
        },

        children:[
            {
                path: APP_ROUTES.CUSTOMER.PRODUCT,
                loadComponent: () =>
                    import('./features/customer/products/products.js')
                        .then((m) => m.Products),
            },
            {
                path:APP_ROUTES.CUSTOMER.CART,
                loadComponent:()=>
                    import('./features/customer/cart/cart.js')
                         .then((m)=>m.Cart)
            },
            {
                path:APP_ROUTES.CUSTOMER.ORDERS,
                loadComponent:()=> 
                    import('./features/customer/my-order/my-order.js')
                .then((m)=>m.MyOrders)
            }

        ]


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
        path: `${APP_ROUTES.CUSTOMER.ROOT}/${APP_ROUTES.CUSTOMER.PRODUCT}`,
        loadComponent: () =>
            import('../app/core/layouts/customer-layout/customer-header/customer-header.js')
                .then((m) => m.CustomerHeader)
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