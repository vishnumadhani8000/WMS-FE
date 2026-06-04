export type OrderStatus = 'Pending' | 'Accepted'|'Dispatched'| 'InTransit' | 'Delivered' | 'Cancelled' | null;

export interface Order {
  orderId: number;
  customerName: string;
  phoneNumber: string;
  cityName: string;
  stateName: string;
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderFilter {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  ascending?: boolean;
  onlyPending?: boolean;
}