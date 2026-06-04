export interface OrderItem {
    orderItemId: number;
    productId: number;
    productName: string;
    quantity: number;
    weightKg: number;
    price: number;
  }
  
  export interface OrderDetail {
    orderId: number;
    customerName: string;
    phoneNumber: string;
    addressLine: string;
    landmark: string;
    cityName: string;
    stateName: string;
    pincode: string;
    totalPrice: number;
    totalWeightKg: number;
    status: string;
    notes: string | null;
    createdAt: string;
    items: OrderItem[];
  }