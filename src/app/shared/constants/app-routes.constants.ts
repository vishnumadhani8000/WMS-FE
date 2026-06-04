
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
        SHIPMENT_MANAGEMENT: 'shipment-management',
        SHIPMENT_DETAIL : 'shipment-details',
        DESTINATION_MANAGEMENT: 'destination-management',
        TRACKER: 'tracker',
        PROFILE: 'profile'
    },

    CUSTOMER: {
        ROOT: 'customer',
        PRODUCT: 'product',
        CART:'cart',
        ORDERS : 'my-orders',
        PROFILE :'profile'
    },

    CUSTOMER_AUTH: {
        ROOT: 'customer',
        SIGN_UP: 'sign-up',
    },
} as const;
