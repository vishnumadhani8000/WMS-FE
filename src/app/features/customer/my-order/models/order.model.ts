export interface OrderItem {
    orderItemId: number;
    productName: string;
    quantity: number;
    price: number;
  }
  
  export interface OrderAddress {
    addressLine: string;
    landmark: string | null;
    cityName: string;
    stateName: string;
    pincode: string;
  }
  
  export interface Order {
    orderId: number;
    totalPrice: number;
    notes: string | null;
    status: string;
    address: OrderAddress;
    createdAt: string;
    items: OrderItem[];
  }
  
  export interface OrderStatusMeta {
    label: string;
    cssClass: string;
    icon: string;
  }
  
  export const ORDER_STATUS_META: Record<string, OrderStatusMeta> = {
    Pending:   { label: 'Pending',   cssClass: 'status--pending',   icon: 'hourglass_empty'    },
    Accepted:  { label: 'Accepted',  cssClass: 'status--accepted',  icon: 'check_circle_outline'},
    Shipped:   { label: 'Shipped',   cssClass: 'status--shipped',   icon: 'local_shipping'     },
    Delivered: { label: 'Delivered', cssClass: 'status--delivered', icon: 'task_alt'           },
    Cancelled: { label: 'Cancelled', cssClass: 'status--cancelled', icon: 'cancel'             },
  };