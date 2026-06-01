
export const APP_ROUTES = {
    AUTH: {
        LOGIN: 'auth/login',
        FORGOT_PW: 'auth/forgot-password',
        RESET_PW: 'auth/reset-password',
    },

    ADMIN: {
        ROOT: 'admin',
        DRIVER_MANAGEMENT: 'driver-management',
        VEHICLE_MANAGEMENT: 'vehicle-management',
        PRODUCT_MANAGEMENT: 'product-management',
        ORDER_MANAGEMENT: 'order-management',
        ORDER_DETAIL : 'order-details',
        DESTINATION_MANAGEMENT: 'destination-management',
        TRACKING: 'tracking',
    },

    CUSTOMER: {
        ROOT: 'customer',
        PRODUCT: 'product',
        CART:'cart',
        ORDERS : 'my-orders',
        PROFILE :'Profile'
    },

    CUSTOMER_AUTH: {
        ROOT: 'customer',
        SIGN_UP: 'sign-up',
    },
} as const;
