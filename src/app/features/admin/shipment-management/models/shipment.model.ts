export type ShipmentStatus = 'Assigned' | 'InTransit' | 'Delivered' | 'Cancelled';

// ── List Item ────────────────────────────────────────────────
export interface Shipment {
  shipmentId: number;
  driverName: string;
  vehicleNumber: string;
  status: ShipmentStatus;
  createdAt: string;
}

// ── Detail ───────────────────────────────────────────────────
export interface ShipmentOrder {
  orderId: number;
  customerName: string;
  totalAmount: number;
  totalWeightKg: number;
  totalPrice: number;
  cityName: string;
  stateName: string;
}

export interface ShipmentDetail {
  shipmentId: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  totalWeightKg: number;
  totalOrders: number;
  createdAt: string;
  status: ShipmentStatus;
  orders: ShipmentOrder[];
}

// ── API Responses ────────────────────────────────────────────
export interface ShipmentListResponse {
  isSuccess: boolean;
  message: string;
  data: {
    items: Shipment[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  errors: string[] | null;
}

export interface ShipmentDetailResponse {
  isSuccess: boolean;
  message: string;
  data: ShipmentDetail;
  errors: string[] | null;
}

export interface ShipmentListResult {
  items: Shipment[];
  totalCount: number;
}

// ── Query Params ─────────────────────────────────────────────
export interface ShipmentQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  ascending?: boolean;

}