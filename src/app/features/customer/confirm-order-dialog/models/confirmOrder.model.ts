import { ApiResponse } from "../../../../core/models/api-responce.model";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryAddress {
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ConfirmOrderDialogData {
  cartId: number;         
  addressId: number;       
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
}

export interface ConfirmOrderDialogResult {
  confirmed: boolean;
  response?: ApiResponse<string>;
}

export interface PlaceOrderPayload {
  cartId: number;
  addressId: number;
}