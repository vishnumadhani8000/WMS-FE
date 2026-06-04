// ── Enums ───────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'Accepted';

// ── Filter ──────────────────────────────────────────────

export interface AdminOrderFilter {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  ascending?: boolean;
  stateId?: number | null;
  cityId?: number | null;
  isPendingAndAccepted?: boolean;
}

// ── Orders ──────────────────────────────────────────────

export interface AdminOrderResponseDto {
  orderId: number;
  customerName: string;
  cityName: string;
  stateName: string;
  totalWeightKg: number;
  totalItems: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminOrderDetailResponseDto {
  orderId: number;
  customerName: string;
  cityName: string;
  stateName: string;
  totalWeightKg: number;
  totalPrice: number;
  status: OrderStatus;
  addressLine: string;
  landmark?: string;
  pincode: string;
  createdAt: string;
  items: OrderItemDetailDto[];
}

export interface OrderItemDetailDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  weightKg: number;
}

// ── Lookup ──────────────────────────────────────────────

export interface StateDto {
  id: number;
  name: string;
}

export interface CityDto {
  id: number;
  name: string;
}

// ── Shipment ────────────────────────────────────────────

export interface AvailableDriverDto {
  id: number;
  name: string;
  phone: string;
}

export interface AvailableVehicleDto {
  id: number;
  name: string;
  plateNumber: string;
  capacityKg: number;
}

export interface MakeShipmentRequest {
  orderIds: number[];
  driverId: number;
  vehicleId: number;
}

export interface MakeShipmentDialogData {
  orderIds: number[];
  cityName: string;
  totalWeightKg: number;
  drivers: AvailableDriverDto[];
  vehicles: AvailableVehicleDto[];
}

export interface MakeShipmentDialogResult {
  confirmed: boolean;
  driverId?: number;
  vehicleId?: number;
}